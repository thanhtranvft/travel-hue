const Hr=[{id:"10",percent:10,multiplier:1.1,count:14,durationMs:6e3,label:"+10%",title:"Bùa Gió Nhẹ",color:"#2ee59d",glow:"#108f5a",accent:"#a8ffd8",keyHint:"1"},{id:"20",percent:20,multiplier:1.2,count:8,durationMs:6e3,label:"+20%",title:"Bùa Lướt Gió",color:"#38d9ff",glow:"#12759e",accent:"#b8f3ff",keyHint:"2"},{id:"30",percent:30,multiplier:1.3,count:4,durationMs:6e3,label:"+30%",title:"Bùa Tia Chớp",color:"#b86bff",glow:"#6322b5",accent:"#ead1ff",keyHint:"3"},{id:"100",percent:100,multiplier:2,count:2,durationMs:5500,label:"+100%",title:"Bùa Siêu Tốc",color:"#ffb838",glow:"#c94912",accent:"#fff0b3",keyHint:"4"}],Is=Object.fromEntries(Hr.map(s=>[s.id,s])),vc=25e3,Ru=35e3,Ov=2.6;function Bv(s){const e=String(s??"");return Object.hasOwn(Is,e)?e:null}function zv(s=Math.random){return Math.round(vc+s()*(Ru-vc))}function Cu(){return{10:0,20:0,30:0,100:0}}function kv(s){const e=Cu();if(!s||typeof s!="object")return e;for(const t of Hr){const n=Number(s[t.id]);e[t.id]=Number.isFinite(n)&&n>0?Math.min(99,Math.floor(n)):0}return e}function cs(s){if(Array.isArray(s)&&s.length>=2){const e=Number(s[0]),t=Number(s[1]);return Number.isFinite(e)&&Number.isFinite(t)?[e,t]:null}if(s&&typeof s=="object"){const e=Number(s.x),t=Number(s.z);return Number.isFinite(e)&&Number.isFinite(t)?[e,t]:null}return null}function Pu(s,e=[]){const t=[],n=(i,r,o,a,c=4.5)=>{const l=Math.hypot(o-i,a-r);if(!(l>1))return;const h=Math.max(1,Math.floor(l/14)),u=-(a-r)/l,f=(o-i)/l;for(let d=0;d<=h;d++){const x=d/h;t.push({x:i+(o-i)*x,z:r+(a-r)*x,nx:u,nz:f,halfWidth:c})}};if(Array.isArray(s?.path))for(let i=1;i<s.path.length;i++){const r=cs(s.path[i-1]),o=cs(s.path[i]);r&&o&&n(r[0],r[1],o[0],o[1],5.2)}for(const i of e||[]){const r=i?.points;if(!(!Array.isArray(r)||r.length<2))for(let o=1;o<r.length;o++){const a=cs(r[o-1]),c=cs(r[o]);a&&c&&n(a[0],a[1],c[0],c[1],4)}}for(const i of s?.extensions||[]){if(!Array.isArray(i)||i.length<3)continue;const r=i.map(cs).filter(Boolean);if(r.length<3)continue;let o=0,a=0;for(const[c,l]of r)o+=c,a+=l;o/=r.length,a/=r.length,t.push({x:o,z:a,nx:1,nz:0,halfWidth:8});for(const[c,l]of r)n(o,a,c,l,4)}return t}function Vv(s,{idPrefix:e="charm",extraRoads:t=[],canPlace:n=()=>!0,groundAt:i=()=>.25,rng:r=Math.random,minSpacing:o=11}={}){const a=Pu(s,t);if(!a.length)return[];const c=[];let l=0;const h=[...Hr].reverse();for(const u of h){let f=0,d=0;const x=u.count*90;for(;f<u.count&&d<x;){d++;const y=a[Math.floor(r()*a.length)],g=d>x*.45?.35:.72,m=(r()*2-1)*y.halfWidth*g,_=(r()*2-1)*5,p=-y.nz,v=y.nx,T=Number((y.x+y.nx*m+p*_).toFixed(2)),S=Number((y.z+y.nz*m+v*_).toFixed(2));if(!Number.isFinite(T)||!Number.isFinite(S)||!n(T,S))continue;const w=d>x*.65?o*.45:o;if(c.some(b=>Math.hypot(b.x-T,b.z-S)<w))continue;const L=Number(i(T,S))||.25;c.push({id:`${e}-${u.id}-${++l}`,tier:u.id,percent:u.percent,multiplier:u.multiplier,x:T,y:L,z:S}),f++}}return c}const Gv=1,Lu=["boy","girl","dog","cat","cow","buffalo"],sh="boy",Iu=["idle","walk","run","bike"],rh=[{id:"boy",label:"Học sinh nam",subtitle:"Khăn quàng đỏ · Ba lô sao",kind:"human",accent:"#2d74d6",bikeColor:"#2477d4"},{id:"girl",label:"Học sinh nữ",subtitle:"Tóc buộc nơ · Đồng phục",kind:"human",accent:"#df5f86",bikeColor:"#d95b84"},{id:"dog",label:"Chú chó con",subtitle:"Cún vàng đáng yêu",kind:"animal",accent:"#d68b3d",bikeColor:"#2d8d7b"},{id:"cat",label:"Chú mèo vàng",subtitle:"Mèo mướp cam · Tai vểnh",kind:"animal",accent:"#eb9430",bikeColor:"#337ac2"},{id:"cow",label:"Chú bò vàng",subtitle:"Bò vàng · Chuông cổ",kind:"animal",accent:"#cf934a",bikeColor:"#378a6a"},{id:"buffalo",label:"Chú trâu đen",subtitle:"Trâu đồng Việt Nam",kind:"animal",accent:"#485463",bikeColor:"#2d70b3"}];function Ds(s){return typeof s=="string"&&Lu.includes(s)?s:sh}function Du(s,e=0){if(typeof s=="string"&&Iu.includes(s))return s;const t=Math.abs(Number(e)||0);return t>=5.9?"bike":t>=2.85?"run":t>=.14?"walk":"idle"}function Nu(s){return typeof s=="string"?Array.from(s.normalize("NFC").replace(/[\p{C}<>]/gu,"").replace(/\s+/g," ").trim()).slice(0,18).join(""):""}const za={id:"free-roam",kind:"default",title:"Dạo phố tự do",shortTitle:"Dạo phố tự do",description:"Tự do tham quan phố Huế, nghe chuông chùa, tiếng rao và nhặt bùa tăng tốc trên đường.",regions:"*",enabled:!0,upcoming:!1,charmsEnabled:!0,maxPlayers:10,createClientSession(){return{update(){},onServerEvent(){},dispose(){}}},createServerRoomState(){return{tick(){},onJoin(){},onLeave(){},onCollision(){},publicSummary(){return null}}}},Uu={minPlayersToStart:2,countdownMs:4e3,roundDurationMs:15e4,intermissionMs:1e4,hotspotRadius:28,hunterSpeedMultiplier:1.08,hunterTagPoints:100,shieldBlockPoints:60,survivalTickMs:5e3,survivalPoints:10,closeCallEnterDist:5.5,closeCallEscapeDist:10.5,closeCallWindowMs:3500,closeCallBasePoints:40,partyBoxCount:8,partyBoxRefreshMs:28e3,partyMaxPerItem:2,shieldDurationMs:6e3,windRadius:9.5,windSlowDurationMs:2e3,windSlowMultiplier:.7,coffeeBoostDurationMs:2e3,coffeeBoostMultiplier:1.25,coopDurationMs:45e3,coopExtraMsPerPlayer:1500,coopRewardPoints:150,emoteCooldownMs:2e3,explorationDurationMs:6e4,chaseDurationMs:45e3,visitRadius:28,visitPoints:120,visitTravelMin:12,coopItemsPerPlayer:2,coopMinItems:4,coopMaxItems:15,coopRadius:70,coopPickupPoints:25},Fu={"quoc-hoc":[{id:"qh-youth",title:"Công viên Thanh Thiếu Niên",x:514.1,z:-463.3},{id:"qh-bia",title:"Bia Quốc Học · Lê Lợi",x:677.1,z:-608.6},{id:"qh-ubnd",title:"UBND Thành phố Huế",x:888.2,z:-799.6},{id:"qh-truong-tien",title:"Ngã ba Lê Lợi · Tràng Tiền",x:1222.4,z:-1107.6}],"quang-trung":[{id:"qt-school",title:"Trường Tiểu học Quang Trung",x:1747.7,z:-234.4},{id:"qt-rhm",title:"Quảng trường RHM · Nguyễn Huệ",x:1816.9,z:-222},{id:"qt-church",title:"Nhà thờ Dòng Chúa Cứu Thế",x:1979.9,z:-193.9}]},Ou={"quoc-hoc":{id:"lanterns",title:"Cùng gom đèn lồng · Lê Lợi",itemKind:"lantern"},"quang-trung":{id:"lotuses",title:"Cùng gom hoa sen · Nguyễn Huệ",itemKind:"lotus"}},ka={rules:Uu,landmarks:Fu,coopTasks:Ou},Se=ka.rules,zi={"non-la-shield":{id:"non-la-shield",name:"Khiên Nón Lá",shortName:"Nón Lá",key:"Q",color:"#ffd36a",glow:"rgba(255, 211, 106, 0.48)",description:"Chặn 1 cú húc hoặc miễn nhiễm choáng giao thông trong 6s"},"perfume-wind":{id:"perfume-wind",name:"Gió Sông Hương",shortName:"Gió Hương",key:"E",color:"#6ee7ff",glow:"rgba(110, 231, 255, 0.45)",description:"Làm chậm 30% đối thủ bám sát trong 2s"},"salt-coffee":{id:"salt-coffee",name:"Cà Phê Muối",shortName:"Cà Phê",key:"F",color:"#ff9b54",glow:"rgba(255, 155, 84, 0.48)",description:"Giải choáng ngay lập tức và vọt +25% tốc độ trong 2s"}},Ho=[zi["non-la-shield"],zi["perfume-wind"],zi["salt-coffee"]],oh=[{id:"wait",text:"Đợi tui với!",short:"Đợi tui!"},{id:"watch",text:"Coi chừng!",short:"Coi chừng!"},{id:"coffee",text:"Cà phê không?",short:"Cà phê?"},{id:"bolt",text:"⚡ Bứt tốc!",short:"⚡"},{id:"laugh",text:"😂 Hụt rồi!",short:"😂"}],ah=new Map(oh.map(s=>[s.id,s])),Bu=ka.landmarks,zu=ka.coopTasks;function ch(s){return typeof s=="string"&&s in zi?s:null}function lh(s){return typeof s=="string"&&ah.has(s)?s:null}function yc(s,e){const t=s.createRoadSampler(e);if(!t)return[];const n=t.areaRoads.length?t.areaRoads.map(o=>o.points):[t.area.region.path],i=[],r=new Set;for(const o of n)for(let a=1;a<(o?.length||0);a++){const c=f=>Array.isArray(f)?{x:f[0],z:f[1]}:f,l=c(o[a-1]),h=c(o[a]),u=Math.max(1,Math.ceil(Math.hypot(h.x-l.x,h.z-l.z)/8));for(let f=0;f<=u;f++){const d=l.x+(h.x-l.x)*f/u,x=l.z+(h.z-l.z)*f/u,y=`${Math.round(d/4)},${Math.round(x/4)}`;r.has(y)||!t.canPlace(d,x)||(r.add(y),i.push({x:d,z:x,y:t.groundAt(d,x)}))}}return i}function ku(){return{"non-la-shield":0,"perfume-wind":0,"salt-coffee":0}}function Mc(s,e,t,n,i){const r=s.areas.get(e);return r?s.contains(r.region,t,n)?{x:t,z:n,heading:i}:null:{x:t,z:n,heading:i}}function Vu(s,e){const t=e.includes("::")?e.split("::")[0]:e,n=Bu[t]||[],i=zu[t]||{title:"Thắp 15 Đèn Lồng Cố Đô",itemKind:"lantern"},r={phase:"waiting",phaseEndsAt:0,stage:"exploration",stageEndsAt:0,destinations:[],coopTarget:0,roundNumber:0,hotspotIndex:0,nextHotspotAt:0,surgeTriggered:!1,partyBoxes:[],partySeq:0,nextPartyBoxRefreshAt:0,coopActive:!1,coopDoneThisRound:!1,coopEndsAt:0,coopCollected:0,coopItems:[],coopSeq:0,lastTickAt:s.now(),lastCheckAt:0,lastBroadcastAt:0,lastAwards:null};function o(){return s.roomPlayers(e).filter(_=>_&&_.send)}function a(_){return _.tagStats||(_.tagStats={role:"runner",visited:new Set,coopContributions:0,visitOrigin:{x:_.x,z:_.z},score:0,tags:0,closeCalls:0,closeCallCombo:0,lastCloseCallAt:0,charmsUsed:0,partyUsed:0,shieldBlocks:0,survivalCarryMs:0,closeCallWatch:new Map}),_.partyInventory||(_.partyInventory=ku()),_.tagStats}function c(){return r.phase!=="playing"||!n.length?null:r.destinations[r.hotspotIndex%Math.max(1,r.destinations.length)]||null}function l(_){return _.map(p=>{const v=a(p);return{id:p.id,name:p.name,color:p.color,role:v.role,score:v.score,visits:v.visited.size,coopContributions:v.coopContributions,tags:v.tags,closeCalls:v.closeCalls,charmsUsed:v.charmsUsed,partyUsed:v.partyUsed,shieldBlocks:v.shieldBlocks}}).sort((p,v)=>v.score-p.score||v.tags-p.tags)}function h(_){const p=l(_);if(!p.length)return[];const v=t==="quang-trung"?"Quang Trung":"Lê Lợi",T=[];for(const[b,M,C,D]of[["visits","explorer","🗺️","Người khám phá Huế"],["coopContributions","companion","🤝","Người bạn đồng hành"],["tags","chaser","🚲","Tay lái tranh tài"]]){const F=[...p].sort((k,z)=>z[b]-k[b])[0];F?.[b]>0&&T.push({id:M,icon:C,title:D,playerName:F.name,detail:`${F[b]} ${b==="visits"?"địa danh":b==="tags"?"lượt bắt":"đóng góp"}`})}p[0].score>0&&T.push({id:"king",icon:"🏆",title:`Hành trình ${v}`,playerName:p[0].name,detail:`${p[0].score} điểm`});const S=[...p].sort((b,M)=>M.closeCalls-b.closeCalls)[0];S&&S.closeCalls>0&&T.push({id:"evader",icon:"💨",title:"Thánh Né Xe",playerName:S.name,detail:`${S.closeCalls} pha thoát hiểm`});const w=[...p].sort((b,M)=>M.charmsUsed+M.partyUsed-(b.charmsUsed+b.partyUsed))[0];w&&w.charmsUsed+w.partyUsed>0&&T.push({id:"charm",icon:"⚡",title:"Thợ Săn Bùa",playerName:w.name,detail:`${w.charmsUsed+w.partyUsed} lần kích hoạt`});const L=[...p].sort((b,M)=>M.shieldBlocks-b.shieldBlocks)[0];return L&&L.shieldBlocks>0&&T.push({id:"shield",icon:"👒",title:"Nón Lá Bất Bại",playerName:L.name,detail:`${L.shieldBlocks} lần đỡ đòn`}),T}function u(_){const p=s.sampleRoadPoints(t,Se.partyBoxCount,`pbox-${++r.partySeq}`);r.partyBoxes=p.map((v,T)=>({id:`pbox-${r.partySeq}-${T}`,x:v.x,y:v.y,z:v.z})),r.nextPartyBoxRefreshAt=_+Se.partyBoxRefreshMs}function f(_){const p=Math.min(Se.coopMaxItems,Math.max(Se.coopMinItems,o().length*Se.coopItemsPerPlayer)),v=c();++r.coopSeq;const T=yc(s,t).filter(S=>v&&Math.hypot(S.x-v.x,S.z-v.z)<=Se.coopRadius).sort((S,w)=>Math.hypot(S.x-v.x,S.z-v.z)-Math.hypot(w.x-v.x,w.z-v.z)).slice(0,p);r.coopTarget=T.length,r.coopItems=T.map((S,w)=>({id:`coop-${r.coopSeq}-${w}`,x:S.x,y:S.y,z:S.z,kind:i.itemKind})),r.coopCollected=0,r.coopActive=T.length>0,r.coopDoneThisRound=!0,r.coopEndsAt=_+Se.coopDurationMs}function d(_,p){const v=_.length>=5?2:1,T=new Set,S=r.roundNumber%Math.max(1,_.length);for(let w=0;w<v&&T.size<_.length;w++)T.add((S+w*2)%_.length);_.forEach((w,L)=>{const b=a(w);b.role=T.has(L)?"hunter":"runner",b.score=0,b.visited=new Set,b.coopContributions=0,b.visitOrigin={x:w.x,z:w.z},b.tags=0,b.closeCalls=0,b.closeCallCombo=0,b.lastCloseCallAt=0,b.charmsUsed=0,b.partyUsed=0,b.shieldBlocks=0,b.survivalCarryMs=0,b.lastSurvivalPose=null,b.closeCallWatch=new Map,w.shieldUntil=0,w.slowedUntil=0,w.coffeeBoostUntil=0,w.immuneUntil=p+2500})}function x(_=s.now()){const p=o(),v=c();return{event:"tag_state",phase:r.phase,stage:r.stage,stageRemainingMs:Math.max(0,r.stageEndsAt-_),roundNumber:r.roundNumber,remainingMs:r.phaseEndsAt?Math.max(0,r.phaseEndsAt-_):0,hotspot:v?{...v,radius:Se.hotspotRadius}:null,coop:r.coopActive?{active:!0,title:i.title.replace(/15 /g,""),itemKind:i.itemKind,collected:r.coopCollected,target:r.coopTarget,remainingMs:Math.max(0,r.coopEndsAt-_),items:r.coopItems}:{active:!1},partyBoxes:r.stage==="chase"?r.partyBoxes:[],leaderboard:l(p).slice(0,5),awards:r.phase==="intermission"?r.lastAwards:null,playerCount:p.length}}function y(_=s.now()){r.lastBroadcastAt=_,s.publishToRoom(e,{type:"mode_event",...x(_)})}function g(_,p){r.roundNumber++,r.phase="countdown",r.phaseEndsAt=p+Se.countdownMs,r.stage="exploration";const v=yc(s,t),T=_.filter(b=>b.ready&&Number.isFinite(b.x)&&Number.isFinite(b.z)),S=T.length?T:_,w=S.reduce((b,M)=>b+(M.x||0),0)/S.length,L=S.reduce((b,M)=>b+(M.z||0),0)/S.length;r.destinations=n.map(b=>{const M=[...v].sort((C,D)=>Math.hypot(C.x-b.x,C.z-b.z)-Math.hypot(D.x-b.x,D.z-b.z))[0];return M&&Math.hypot(M.x-b.x,M.z-b.z)<=90?{...b,x:M.x,z:M.z}:null}).filter(Boolean).sort((b,M)=>Math.hypot(b.x-w,b.z-L)-Math.hypot(M.x-w,M.z-L)),r.hotspotIndex=0,r.surgeTriggered=!1,r.coopActive=!1,r.coopDoneThisRound=!1,r.coopItems=[],r.lastAwards=null,d(_,p),u(p);for(const b of _)s.send(b,{type:"mode_event",event:"party_inventory",inventory:{...b.partyInventory}});y(p)}function m(_,p){r.phase="intermission",r.phaseEndsAt=p+Se.intermissionMs,r.coopActive=!1,r.coopItems=[],r.lastAwards=h(_),s.publishToRoom(e,{type:"mode_event",event:"round_end",leaderboard:l(_),awards:r.lastAwards,nextRoundInMs:Se.intermissionMs}),y(p)}return{speedMultiplierFor(_,p=s.now()){const v=a(_);let T=r.phase==="playing"&&r.stage==="chase"&&v.role==="hunter"?Se.hunterSpeedMultiplier:1;return(_.coffeeBoostUntil||0)>p&&(T*=Se.coffeeBoostMultiplier),T},publicPlayerData(_,p=s.now()){const v=a(_);return{role:v.role,score:v.score,tags:v.tags,closeCalls:v.closeCalls,shielded:(_.shieldUntil||0)>p,slowed:(_.slowedUntil||0)>p,coffeeBoost:(_.coffeeBoostUntil||0)>p}},publicSummary(){return x(s.now())},onJoin(_){const p=s.now();a(_);const v=o();if(r.phase==="playing"){const T=v.some(S=>S.tagStats?.role==="hunter");_.tagStats.role=T?"runner":"hunter",_.immuneUntil=p+3e3}r.partyBoxes.length||u(p),s.send(_,{type:"mode_event",event:"party_inventory",inventory:{..._.partyInventory}}),r.phase==="waiting"&&v.length>=Se.minPlayersToStart?g(v,p):y(p)},onLeave(_){const p=s.now(),v=o().filter(T=>T!==_);if(v.length<Se.minPlayersToStart){r.phase="waiting",r.phaseEndsAt=0,r.coopActive=!1,r.coopItems=[];for(const T of v)a(T).role="runner";y(p);return}if(r.phase==="playing"&&!v.some(T=>a(T).role==="hunter")){const T=v[0];a(T).role="hunter",T.immuneUntil=p+2e3,s.publishToRoom(e,{type:"mode_event",event:"tag_banner",text:`🔥 ${T.name} đảm nhận vai Người Săn mới!`}),y(p)}},onCharmUsed(_){a(_).charmsUsed++},onCollision(_,p,v,T,S){const w=a(_),L=a(p),b=p.x-_.x||Math.sin(_.heading||0),M=p.z-_.z||Math.cos(_.heading||0),C=Math.hypot(b,M)||1,D=b/C,F=M/C,k=Mc(s,_.region,(S?.x??_.x)-D*1.35,(S?.z??_.z)-F*1.35,_.heading),z=Mc(s,p.region,p.x+D*1.35,p.z+F*1.35,p.heading);if(k?(_.x=k.x,_.z=k.z):S&&(_.x=S.x,_.z=S.z),z&&(p.x=z.x,p.z=z.z),_.speed=0,_.lean=0,p.speed=0,p.lean=0,!(r.phase==="playing"&&r.stage==="chase"&&(w.role==="hunter"&&L.role==="runner"||w.role==="runner"&&L.role==="hunter")))return _.stunnedUntil=T+350,p.stunnedUntil=T+350,_.immuneUntil=T+1800,p.immuneUntil=T+1800,s.send(_,{type:"mode_event",event:"tag_bump",relocate:{x:_.x,z:_.z,speed:0},otherName:p.name}),s.send(p,{type:"mode_event",event:"tag_bump",relocate:{x:p.x,z:p.z,speed:0},otherName:_.name}),!0;const Y=w.role==="hunter"?_:p,G=w.role==="runner"?_:p,ne=Y.tagStats,oe=G.tagStats;return(G.shieldUntil||0)>T?(G.shieldUntil=0,G.immuneUntil=T+2200,oe.shieldBlocks++,oe.score+=Se.shieldBlockPoints,Y.stunnedUntil=T+800,Y.immuneUntil=T+2200,s.send(G,{type:"mode_event",event:"shield_block",role:"defender",points:Se.shieldBlockPoints,attackerName:Y.name,relocate:{x:G.x,z:G.z,speed:0}}),s.send(Y,{type:"mode_event",event:"shield_block",role:"attacker",defenderName:G.name,stunMs:800,relocate:{x:Y.x,z:Y.z,speed:0}}),s.publishToRoom(e,{type:"mode_event",event:"tag_banner",text:`👒 ${G.name} dùng Khiên Nón Lá hất văng ${Y.name}! (+${Se.shieldBlockPoints}đ)`}),y(T),!0):(ne.tags++,ne.score+=Se.hunterTagPoints,ne.role="runner",oe.role="hunter",oe.closeCallWatch?.clear?.(),G.immuneUntil=T+3e3,G.stunnedUntil=T+450,Y.immuneUntil=T+2200,s.send(Y,{type:"mode_event",event:"tag_swap",youTagged:!0,points:Se.hunterTagPoints,victimName:G.name,relocate:{x:Y.x,z:Y.z,speed:0}}),s.send(G,{type:"mode_event",event:"tag_swap",youWereTagged:!0,hunterName:Y.name,stunMs:450,relocate:{x:G.x,z:G.z,speed:0}}),s.publishToRoom(e,{type:"mode_event",event:"tag_banner",text:`🔥 ${Y.name} bắt trúng ${G.name}! Đổi vai Người Săn (+${Se.hunterTagPoints}đ)`}),y(T),!0)},onAction(_,p,v,T=s.now()){const S=a(_),w=p.action;if(!((w==="party_pickup"||w==="use_party_item")&&(r.phase!=="playing"||r.stage!=="chase"))){if(w==="party_pickup"){const L=typeof p.boxId=="string"?p.boxId:"",b=r.partyBoxes.findIndex(V=>V.id===L);if(b===-1)return;const M=r.partyBoxes[b];if(Math.hypot((_.x||0)-M.x,(_.z||0)-M.z)>6.2)return;r.partyBoxes.splice(b,1);const C=Ho.filter(V=>(_.partyInventory[V.id]||0)<Se.partyMaxPerItem),D=C.length?C:Ho,F=D.filter(V=>(_.partyInventory[V.id]||0)===0),k=F.length?F:D,z=k[(r.partySeq+Math.floor(T)+b)%k.length];_.partyInventory[z.id]=Math.min(Se.partyMaxPerItem,(_.partyInventory[z.id]||0)+1),s.send(_,{type:"mode_event",event:"party_inventory",inventory:{..._.partyInventory},pickedItem:z.id}),y(T);return}if(w==="use_party_item"){const L=ch(p.itemId);if(!L||(_.partyInventory[L]||0)<=0){s.send(_,{type:"mode_event",event:"party_inventory",inventory:{..._.partyInventory},rejected:!0});return}if(_.partyInventory[L]--,S.partyUsed++,L==="non-la-shield")_.shieldUntil=T+Se.shieldDurationMs,s.send(_,{type:"mode_event",event:"party_used",itemId:L,durationMs:Se.shieldDurationMs});else if(L==="perfume-wind"){const b=[];for(const M of o()){if(M===_||(M.shieldUntil||0)>T)continue;Math.hypot((M.x||0)-(_.x||0),(M.z||0)-(_.z||0))<=Se.windRadius&&(M.slowedUntil=T+Se.windSlowDurationMs,b.push(M.id),s.send(M,{type:"mode_event",event:"wind_slowed",byName:_.name,durationMs:Se.windSlowDurationMs}))}s.publishToRoom(e,{type:"mode_event",event:"wind_gust",casterId:_.id,x:_.x,y:_.y||.3,z:_.z,hitCount:b.length})}else L==="salt-coffee"&&(_.stunnedUntil=0,_.slowedUntil=0,_.coffeeBoostUntil=T+Se.coffeeBoostDurationMs,s.send(_,{type:"mode_event",event:"coffee_boost",durationMs:Se.coffeeBoostDurationMs,multiplier:Se.coffeeBoostMultiplier}));s.send(_,{type:"mode_event",event:"party_inventory",inventory:{..._.partyInventory}}),y(T);return}if(w==="coop_pickup"){if(!r.coopActive||!_.ready||r.stage!=="cooperation"||T>=r.coopEndsAt)return;const L=typeof p.itemId=="string"?p.itemId:"",b=r.coopItems.findIndex(C=>C.id===L);if(b===-1)return;const M=r.coopItems[b];if(Math.hypot((_.x||0)-M.x,(_.z||0)-M.z)>6.2)return;if(r.coopItems.splice(b,1),r.coopCollected++,S.coopContributions++,S.score+=Se.coopPickupPoints,r.coopCollected>=r.coopTarget){r.coopActive=!1,r.coopItems=[];const C=o();for(const D of C)a(D).coopContributions>0&&(D.tagStats.score+=Se.coopRewardPoints);s.publishToRoom(e,{type:"mode_event",event:"coop_end",success:!0,title:i.title,reward:Se.coopRewardPoints})}y(T);return}if(w==="emote"){const L=lh(p.emoteId);if(!L||T-(_.lastEmoteAt||0)<Se.emoteCooldownMs)return;_.lastEmoteAt=T;const b=ah.get(L);s.publishToRoom(e,{type:"mode_event",event:"emote",playerId:_.id,playerName:_.name,emoteId:L,text:b.text});return}w==="traffic_shield_block"&&(_.shieldUntil||0)>T&&(_.shieldUntil=0,S.shieldBlocks++,S.score+=30,y(T))}},tick(_,p,v=s.now()){const T=Math.max(0,Math.min(500,v-r.lastTickAt));r.lastTickAt=v;const S=o();if(!S.length){r.phase="waiting",r.coopActive=!1;return}if(S.length<Se.minPlayersToStart){if(r.phase!=="waiting"){r.phase="waiting",r.phaseEndsAt=0,r.coopActive=!1,r.coopItems=[];for(const L of S)a(L).role="runner";y(v)}(!r.partyBoxes.length||v>=r.nextPartyBoxRefreshAt)&&(u(v),y(v));return}if(r.phase==="waiting"){g(S,v);return}if(r.phase==="countdown"){v>=r.phaseEndsAt?(r.phase="playing",r.phaseEndsAt=v+Se.roundDurationMs,r.stageEndsAt=v+Se.explorationDurationMs,r.nextHotspotAt=1/0,y(v)):v-r.lastBroadcastAt>=500&&y(v);return}if(r.phase==="intermission"){v>=r.phaseEndsAt?g(S,v):v-r.lastBroadcastAt>=1e3&&y(v);return}if(Math.max(0,r.phaseEndsAt-v)===0){m(S,v);return}if(v>=r.stageEndsAt&&r.stage==="exploration"){r.stage="chase",r.stageEndsAt=v+Se.chaseDurationMs;for(const L of S)L.immuneUntil=v+3e3,a(L).survivalCarryMs=0;s.publishToRoom(e,{type:"mode_event",event:"tag_banner",text:"🚲 Tranh tài ngắn: bắt và đổi vai!"}),y(v)}else if(v>=r.stageEndsAt&&r.stage==="chase"){r.stage="cooperation";const L=Se.coopDurationMs+Math.max(0,S.length-2)*Se.coopExtraMsPerPlayer;r.phaseEndsAt=v+L,r.stageEndsAt=r.phaseEndsAt;const b=S.filter(M=>M.ready);if(b.length&&r.destinations.length){const M=C=>b.reduce((D,F)=>D+Math.hypot(F.x-C.x,F.z-C.z),0)/b.length;r.hotspotIndex=r.destinations.reduce((C,D,F)=>M(D)<M(r.destinations[C])?F:C,0)}f(v),r.coopEndsAt=r.stageEndsAt;for(const M of S)M.slowedUntil=0,M.coffeeBoostUntil=0;s.publishToRoom(e,{type:"mode_event",event:"coop_start",title:i.title,target:r.coopTarget,durationMs:L}),y(v)}if(r.stage==="exploration"){for(const b of S){const M=a(b);if(!b.ready)continue;const C=M.visitOrigin;if(!(Math.hypot(b.x-C.x,b.z-C.z)<Se.visitTravelMin))for(const D of r.destinations)M.visited.has(D.id)||Math.hypot(b.x-D.x,b.z-D.z)>Se.visitRadius||(M.visited.add(D.id),M.score+=Se.visitPoints,s.send(b,{type:"mode_event",event:"landmark_visit",title:D.title,points:Se.visitPoints}))}const L=c();L&&S.filter(b=>b.ready).length&&S.filter(b=>b.ready).every(b=>a(b).visited.has(L.id))&&r.hotspotIndex<r.destinations.length-1&&r.hotspotIndex++}if(r.coopActive&&v>=r.coopEndsAt&&(r.coopActive=!1,r.coopItems=[],s.publishToRoom(e,{type:"mode_event",event:"coop_end",success:!1,title:i.title}),y(v)),(!r.partyBoxes.length||v>=r.nextPartyBoxRefreshAt)&&(u(v),y(v)),r.stage==="chase"&&v-r.lastCheckAt>=200){const L=v-r.lastCheckAt>1e3?T:v-r.lastCheckAt;r.lastCheckAt=v;const b=c(),M=S.filter(C=>a(C).role==="hunter"&&C.ready&&v>=(C.stunnedUntil||0));for(const C of S){const D=a(C);if(D.role!=="runner"||!C.ready)continue;const F=b&&Math.hypot((C.x||0)-b.x,(C.z||0)-b.z)<=Se.hotspotRadius,k=D.lastSurvivalPose;if(D.lastSurvivalPose={x:C.x,z:C.z},!(k&&Math.hypot(C.x-k.x,C.z-k.z)>.05&&Math.abs(C.speed||0)>.5&&M.some(Y=>Math.hypot(C.x-Y.x,C.z-Y.z)<=40&&Math.abs(Y.speed||0)>.5))){D.survivalCarryMs=0,D.closeCallWatch.clear();continue}D.survivalCarryMs+=L*(F?2:1),D.survivalCarryMs>=Se.survivalTickMs&&(D.survivalCarryMs-=Se.survivalTickMs,D.score+=Se.survivalPoints);for(const Y of M){const G=Math.hypot((C.x||0)-(Y.x||0),(C.z||0)-(Y.z||0)),ne=D.closeCallWatch.get(Y.id);if(!ne)G<=Se.closeCallEnterDist&&v>=(C.stunnedUntil||0)&&D.closeCallWatch.set(Y.id,{enteredAt:v,minDist:G});else if(ne.minDist=Math.min(ne.minDist,G),v-ne.enteredAt>Se.closeCallWindowMs)D.closeCallWatch.delete(Y.id);else if(G>=Se.closeCallEscapeDist){D.closeCallWatch.delete(Y.id),v-D.lastCloseCallAt<=15e3?D.closeCallCombo=Math.min(2,(D.closeCallCombo||1)+.5):D.closeCallCombo=1,D.lastCloseCallAt=v,D.closeCalls++;const oe=Math.round(Se.closeCallBasePoints*D.closeCallCombo);D.score+=oe,s.send(C,{type:"mode_event",event:"close_call",points:oe,combo:D.closeCallCombo,hunterName:Y.name})}}}}v-r.lastBroadcastAt>=650&&y(v)}}}const Va="181",Gu=0,bc=1,Hu=2,hh=1,Wu=2,Fn=3,Gn=0,qt=1,Et=2,kn=0,ki=1,Sc=2,Tc=3,Ec=4,Xu=5,fi=100,qu=101,Yu=102,$u=103,Ku=104,ju=200,Ju=201,Zu=202,Qu=203,Wo=204,Xo=205,ed=206,td=207,nd=208,id=209,sd=210,rd=211,od=212,ad=213,cd=214,qo=0,Yo=1,$o=2,Wi=3,Ko=4,jo=5,Jo=6,Zo=7,uh=0,ld=1,hd=2,ti=0,ud=1,dd=2,fd=3,pd=4,md=5,xd=6,gd=7,Ac="attached",_d="detached",dh=300,Xi=301,qi=302,Qo=303,ea=304,Wr=306,Yi=1e3,bn=1001,Fr=1002,Vt=1003,fh=1004,Ss=1005,zt=1006,Pr=1007,On=1008,Tn=1009,ph=1010,mh=1011,Ns=1012,Ga=1013,mi=1014,mn=1015,ts=1016,Ha=1017,Wa=1018,Us=1020,xh=35902,gh=35899,_h=1021,vh=1022,an=1023,Fs=1026,Os=1027,Xa=1028,qa=1029,Ya=1030,$a=1031,Ka=1033,Lr=33776,Ir=33777,Dr=33778,Nr=33779,ta=35840,na=35841,ia=35842,sa=35843,ra=36196,oa=37492,aa=37496,ca=37808,la=37809,ha=37810,ua=37811,da=37812,fa=37813,pa=37814,ma=37815,xa=37816,ga=37817,_a=37818,va=37819,ya=37820,Ma=37821,ba=36492,Sa=36494,Ta=36495,Ea=36283,Aa=36284,wa=36285,Ra=36286,Bs=2300,zs=2301,Qr=2302,wc=2400,Rc=2401,Cc=2402,vd=2500,yd=0,yh=1,Ca=2,Md=3200,bd=3201,Mh=0,Sd=1,Zn="",wt="srgb",Gt="srgb-linear",Or="linear",dt="srgb",vi=7680,Pc=519,Td=512,Ed=513,Ad=514,bh=515,wd=516,Rd=517,Cd=518,Pd=519,Pa=35044,Hv=35048,Lc="300 es",Sn=2e3,Br=2001;function Sh(s){for(let e=s.length-1;e>=0;--e)if(s[e]>=65535)return!0;return!1}function ks(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function Ld(){const s=ks("canvas");return s.style.display="block",s}const Ic={};function zr(...s){const e="THREE."+s.shift();console.log(e,...s)}function Pe(...s){const e="THREE."+s.shift();console.warn(e,...s)}function $e(...s){const e="THREE."+s.shift();console.error(e,...s)}function Vs(...s){const e=s.join(" ");e in Ic||(Ic[e]=!0,Pe(...s))}function Id(s,e,t){return new Promise(function(n,i){function r(){switch(s.clientWaitSync(e,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:i();break;case s.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}class ns{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){const n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){const n=this._listeners;if(n===void 0)return;const i=n[e];if(i!==void 0){const r=i.indexOf(t);r!==-1&&i.splice(r,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const n=t[e.type];if(n!==void 0){e.target=this;const i=n.slice(0);for(let r=0,o=i.length;r<o;r++)i[r].call(this,e);e.target=null}}}const It=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let Dc=1234567;const As=Math.PI/180,$i=180/Math.PI;function cn(){const s=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(It[s&255]+It[s>>8&255]+It[s>>16&255]+It[s>>24&255]+"-"+It[e&255]+It[e>>8&255]+"-"+It[e>>16&15|64]+It[e>>24&255]+"-"+It[t&63|128]+It[t>>8&255]+"-"+It[t>>16&255]+It[t>>24&255]+It[n&255]+It[n>>8&255]+It[n>>16&255]+It[n>>24&255]).toLowerCase()}function Ke(s,e,t){return Math.max(e,Math.min(t,s))}function ja(s,e){return(s%e+e)%e}function Dd(s,e,t,n,i){return n+(s-e)*(i-n)/(t-e)}function Nd(s,e,t){return s!==e?(t-s)/(e-s):0}function ws(s,e,t){return(1-t)*s+t*e}function Ud(s,e,t,n){return ws(s,e,1-Math.exp(-t*n))}function Fd(s,e=1){return e-Math.abs(ja(s,e*2)-e)}function Od(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*(3-2*s))}function Bd(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*s*(s*(s*6-15)+10))}function zd(s,e){return s+Math.floor(Math.random()*(e-s+1))}function kd(s,e){return s+Math.random()*(e-s)}function Vd(s){return s*(.5-Math.random())}function Gd(s){s!==void 0&&(Dc=s);let e=Dc+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Hd(s){return s*As}function Wd(s){return s*$i}function Xd(s){return(s&s-1)===0&&s!==0}function qd(s){return Math.pow(2,Math.ceil(Math.log(s)/Math.LN2))}function Yd(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}function $d(s,e,t,n,i){const r=Math.cos,o=Math.sin,a=r(t/2),c=o(t/2),l=r((e+n)/2),h=o((e+n)/2),u=r((e-n)/2),f=o((e-n)/2),d=r((n-e)/2),x=o((n-e)/2);switch(i){case"XYX":s.set(a*h,c*u,c*f,a*l);break;case"YZY":s.set(c*f,a*h,c*u,a*l);break;case"ZXZ":s.set(c*u,c*f,a*h,a*l);break;case"XZX":s.set(a*h,c*x,c*d,a*l);break;case"YXY":s.set(c*d,a*h,c*x,a*l);break;case"ZYZ":s.set(c*x,c*d,a*h,a*l);break;default:Pe("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+i)}}function pn(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("Invalid component type.")}}function ct(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("Invalid component type.")}}const Kd={DEG2RAD:As,RAD2DEG:$i,generateUUID:cn,clamp:Ke,euclideanModulo:ja,mapLinear:Dd,inverseLerp:Nd,lerp:ws,damp:Ud,pingpong:Fd,smoothstep:Od,smootherstep:Bd,randInt:zd,randFloat:kd,randFloatSpread:Vd,seededRandom:Gd,degToRad:Hd,radToDeg:Wd,isPowerOfTwo:Xd,ceilPowerOfTwo:qd,floorPowerOfTwo:Yd,setQuaternionFromProperEuler:$d,normalize:ct,denormalize:pn};class te{constructor(e=0,t=0){te.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6],this.y=i[1]*t+i[4]*n+i[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Ke(this.x,e.x,t.x),this.y=Ke(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Ke(this.x,e,t),this.y=Ke(this.y,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Ke(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Ke(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),i=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*n-o*i+e.x,this.y=r*i+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class ni{constructor(e=0,t=0,n=0,i=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=i}static slerpFlat(e,t,n,i,r,o,a){let c=n[i+0],l=n[i+1],h=n[i+2],u=n[i+3],f=r[o+0],d=r[o+1],x=r[o+2],y=r[o+3];if(a<=0){e[t+0]=c,e[t+1]=l,e[t+2]=h,e[t+3]=u;return}if(a>=1){e[t+0]=f,e[t+1]=d,e[t+2]=x,e[t+3]=y;return}if(u!==y||c!==f||l!==d||h!==x){let g=c*f+l*d+h*x+u*y;g<0&&(f=-f,d=-d,x=-x,y=-y,g=-g);let m=1-a;if(g<.9995){const _=Math.acos(g),p=Math.sin(_);m=Math.sin(m*_)/p,a=Math.sin(a*_)/p,c=c*m+f*a,l=l*m+d*a,h=h*m+x*a,u=u*m+y*a}else{c=c*m+f*a,l=l*m+d*a,h=h*m+x*a,u=u*m+y*a;const _=1/Math.sqrt(c*c+l*l+h*h+u*u);c*=_,l*=_,h*=_,u*=_}}e[t]=c,e[t+1]=l,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,i,r,o){const a=n[i],c=n[i+1],l=n[i+2],h=n[i+3],u=r[o],f=r[o+1],d=r[o+2],x=r[o+3];return e[t]=a*x+h*u+c*d-l*f,e[t+1]=c*x+h*f+l*u-a*d,e[t+2]=l*x+h*d+a*f-c*u,e[t+3]=h*x-a*u-c*f-l*d,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,i){return this._x=e,this._y=t,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,i=e._y,r=e._z,o=e._order,a=Math.cos,c=Math.sin,l=a(n/2),h=a(i/2),u=a(r/2),f=c(n/2),d=c(i/2),x=c(r/2);switch(o){case"XYZ":this._x=f*h*u+l*d*x,this._y=l*d*u-f*h*x,this._z=l*h*x+f*d*u,this._w=l*h*u-f*d*x;break;case"YXZ":this._x=f*h*u+l*d*x,this._y=l*d*u-f*h*x,this._z=l*h*x-f*d*u,this._w=l*h*u+f*d*x;break;case"ZXY":this._x=f*h*u-l*d*x,this._y=l*d*u+f*h*x,this._z=l*h*x+f*d*u,this._w=l*h*u-f*d*x;break;case"ZYX":this._x=f*h*u-l*d*x,this._y=l*d*u+f*h*x,this._z=l*h*x-f*d*u,this._w=l*h*u+f*d*x;break;case"YZX":this._x=f*h*u+l*d*x,this._y=l*d*u+f*h*x,this._z=l*h*x-f*d*u,this._w=l*h*u-f*d*x;break;case"XZY":this._x=f*h*u-l*d*x,this._y=l*d*u-f*h*x,this._z=l*h*x+f*d*u,this._w=l*h*u+f*d*x;break;default:Pe("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,i=Math.sin(n);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],i=t[4],r=t[8],o=t[1],a=t[5],c=t[9],l=t[2],h=t[6],u=t[10],f=n+a+u;if(f>0){const d=.5/Math.sqrt(f+1);this._w=.25/d,this._x=(h-c)*d,this._y=(r-l)*d,this._z=(o-i)*d}else if(n>a&&n>u){const d=2*Math.sqrt(1+n-a-u);this._w=(h-c)/d,this._x=.25*d,this._y=(i+o)/d,this._z=(r+l)/d}else if(a>u){const d=2*Math.sqrt(1+a-n-u);this._w=(r-l)/d,this._x=(i+o)/d,this._y=.25*d,this._z=(c+h)/d}else{const d=2*Math.sqrt(1+u-n-a);this._w=(o-i)/d,this._x=(r+l)/d,this._y=(c+h)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Ke(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const i=Math.min(1,t/n);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,i=e._y,r=e._z,o=e._w,a=t._x,c=t._y,l=t._z,h=t._w;return this._x=n*h+o*a+i*l-r*c,this._y=i*h+o*c+r*a-n*l,this._z=r*h+o*l+n*c-i*a,this._w=o*h-n*a-i*c-r*l,this._onChangeCallback(),this}slerp(e,t){if(t<=0)return this;if(t>=1)return this.copy(e);let n=e._x,i=e._y,r=e._z,o=e._w,a=this.dot(e);a<0&&(n=-n,i=-i,r=-r,o=-o,a=-a);let c=1-t;if(a<.9995){const l=Math.acos(a),h=Math.sin(l);c=Math.sin(c*l)/h,t=Math.sin(t*l)/h,this._x=this._x*c+n*t,this._y=this._y*c+i*t,this._z=this._z*c+r*t,this._w=this._w*c+o*t,this._onChangeCallback()}else this._x=this._x*c+n*t,this._y=this._y*c+i*t,this._z=this._z*c+r*t,this._w=this._w*c+o*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(i*Math.sin(e),i*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class I{constructor(e=0,t=0,n=0){I.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(Nc.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(Nc.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*i,this.y=r[1]*t+r[4]*n+r[7]*i,this.z=r[2]*t+r[5]*n+r[8]*i,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,r=e.elements,o=1/(r[3]*t+r[7]*n+r[11]*i+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*i+r[12])*o,this.y=(r[1]*t+r[5]*n+r[9]*i+r[13])*o,this.z=(r[2]*t+r[6]*n+r[10]*i+r[14])*o,this}applyQuaternion(e){const t=this.x,n=this.y,i=this.z,r=e.x,o=e.y,a=e.z,c=e.w,l=2*(o*i-a*n),h=2*(a*t-r*i),u=2*(r*n-o*t);return this.x=t+c*l+o*u-a*h,this.y=n+c*h+a*l-r*u,this.z=i+c*u+r*h-o*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*i,this.y=r[1]*t+r[5]*n+r[9]*i,this.z=r[2]*t+r[6]*n+r[10]*i,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Ke(this.x,e.x,t.x),this.y=Ke(this.y,e.y,t.y),this.z=Ke(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Ke(this.x,e,t),this.y=Ke(this.y,e,t),this.z=Ke(this.z,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Ke(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,i=e.y,r=e.z,o=t.x,a=t.y,c=t.z;return this.x=i*c-r*a,this.y=r*o-n*c,this.z=n*a-i*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return eo.copy(this).projectOnVector(e),this.sub(eo)}reflect(e){return this.sub(eo.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(Ke(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,i=this.z-e.z;return t*t+n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const i=Math.sin(t)*e;return this.x=i*Math.sin(n),this.y=Math.cos(t)*e,this.z=i*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),i=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=i,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const eo=new I,Nc=new ni;class Xe{constructor(e,t,n,i,r,o,a,c,l){Xe.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,i,r,o,a,c,l)}set(e,t,n,i,r,o,a,c,l){const h=this.elements;return h[0]=e,h[1]=i,h[2]=a,h[3]=t,h[4]=r,h[5]=c,h[6]=n,h[7]=o,h[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,r=this.elements,o=n[0],a=n[3],c=n[6],l=n[1],h=n[4],u=n[7],f=n[2],d=n[5],x=n[8],y=i[0],g=i[3],m=i[6],_=i[1],p=i[4],v=i[7],T=i[2],S=i[5],w=i[8];return r[0]=o*y+a*_+c*T,r[3]=o*g+a*p+c*S,r[6]=o*m+a*v+c*w,r[1]=l*y+h*_+u*T,r[4]=l*g+h*p+u*S,r[7]=l*m+h*v+u*w,r[2]=f*y+d*_+x*T,r[5]=f*g+d*p+x*S,r[8]=f*m+d*v+x*w,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],h=e[8];return t*o*h-t*a*l-n*r*h+n*a*c+i*r*l-i*o*c}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],h=e[8],u=h*o-a*l,f=a*c-h*r,d=l*r-o*c,x=t*u+n*f+i*d;if(x===0)return this.set(0,0,0,0,0,0,0,0,0);const y=1/x;return e[0]=u*y,e[1]=(i*l-h*n)*y,e[2]=(a*n-i*o)*y,e[3]=f*y,e[4]=(h*t-i*c)*y,e[5]=(i*r-a*t)*y,e[6]=d*y,e[7]=(n*c-l*t)*y,e[8]=(o*t-n*r)*y,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,i,r,o,a){const c=Math.cos(r),l=Math.sin(r);return this.set(n*c,n*l,-n*(c*o+l*a)+o+e,-i*l,i*c,-i*(-l*o+c*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(to.makeScale(e,t)),this}rotate(e){return this.premultiply(to.makeRotation(-e)),this}translate(e,t){return this.premultiply(to.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<9;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const to=new Xe,Uc=new Xe().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Fc=new Xe().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function jd(){const s={enabled:!0,workingColorSpace:Gt,spaces:{},convert:function(i,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===dt&&(i.r=Vn(i.r),i.g=Vn(i.g),i.b=Vn(i.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(i.applyMatrix3(this.spaces[r].toXYZ),i.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===dt&&(i.r=Vi(i.r),i.g=Vi(i.g),i.b=Vi(i.b))),i},workingToColorSpace:function(i,r){return this.convert(i,this.workingColorSpace,r)},colorSpaceToWorking:function(i,r){return this.convert(i,r,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===Zn?Or:this.spaces[i].transfer},getToneMappingMode:function(i){return this.spaces[i].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(i,r=this.workingColorSpace){return i.fromArray(this.spaces[r].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,r,o){return i.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(i,r){return Vs("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),s.workingToColorSpace(i,r)},toWorkingColorSpace:function(i,r){return Vs("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),s.colorSpaceToWorking(i,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return s.define({[Gt]:{primaries:e,whitePoint:n,transfer:Or,toXYZ:Uc,fromXYZ:Fc,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:wt},outputColorSpaceConfig:{drawingBufferColorSpace:wt}},[wt]:{primaries:e,whitePoint:n,transfer:dt,toXYZ:Uc,fromXYZ:Fc,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:wt}}}),s}const nt=jd();function Vn(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function Vi(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}let yi;class Jd{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{yi===void 0&&(yi=ks("canvas")),yi.width=e.width,yi.height=e.height;const i=yi.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),n=yi}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=ks("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const i=n.getImageData(0,0,e.width,e.height),r=i.data;for(let o=0;o<r.length;o++)r[o]=Vn(r[o]/255)*255;return n.putImageData(i,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Vn(t[n]/255)*255):t[n]=Vn(t[n]);return{data:t,width:e.width,height:e.height}}else return Pe("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let Zd=0;class Ja{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Zd++}),this.uuid=cn(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let r;if(Array.isArray(i)){r=[];for(let o=0,a=i.length;o<a;o++)i[o].isDataTexture?r.push(no(i[o].image)):r.push(no(i[o]))}else r=no(i);n.url=r}return t||(e.images[this.uuid]=n),n}}function no(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?Jd.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(Pe("Texture: Unable to serialize Texture."),{})}let Qd=0;const io=new I;class Rt extends ns{constructor(e=Rt.DEFAULT_IMAGE,t=Rt.DEFAULT_MAPPING,n=bn,i=bn,r=zt,o=On,a=an,c=Tn,l=Rt.DEFAULT_ANISOTROPY,h=Zn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Qd++}),this.uuid=cn(),this.name="",this.source=new Ja(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=r,this.minFilter=o,this.anisotropy=l,this.format=a,this.internalFormat=null,this.type=c,this.offset=new te(0,0),this.repeat=new te(1,1),this.center=new te(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Xe,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(io).x}get height(){return this.source.getSize(io).y}get depth(){return this.source.getSize(io).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const n=e[t];if(n===void 0){Pe(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const i=this[t];if(i===void 0){Pe(`Texture.setValues(): property '${t}' does not exist.`);continue}i&&n&&i.isVector2&&n.isVector2||i&&n&&i.isVector3&&n.isVector3||i&&n&&i.isMatrix3&&n.isMatrix3?i.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==dh)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Yi:e.x=e.x-Math.floor(e.x);break;case bn:e.x=e.x<0?0:1;break;case Fr:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Yi:e.y=e.y-Math.floor(e.y);break;case bn:e.y=e.y<0?0:1;break;case Fr:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Rt.DEFAULT_IMAGE=null;Rt.DEFAULT_MAPPING=dh;Rt.DEFAULT_ANISOTROPY=1;class ot{constructor(e=0,t=0,n=0,i=1){ot.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,i){return this.x=e,this.y=t,this.z=n,this.w=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*i+o[12]*r,this.y=o[1]*t+o[5]*n+o[9]*i+o[13]*r,this.z=o[2]*t+o[6]*n+o[10]*i+o[14]*r,this.w=o[3]*t+o[7]*n+o[11]*i+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,i,r;const c=e.elements,l=c[0],h=c[4],u=c[8],f=c[1],d=c[5],x=c[9],y=c[2],g=c[6],m=c[10];if(Math.abs(h-f)<.01&&Math.abs(u-y)<.01&&Math.abs(x-g)<.01){if(Math.abs(h+f)<.1&&Math.abs(u+y)<.1&&Math.abs(x+g)<.1&&Math.abs(l+d+m-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const p=(l+1)/2,v=(d+1)/2,T=(m+1)/2,S=(h+f)/4,w=(u+y)/4,L=(x+g)/4;return p>v&&p>T?p<.01?(n=0,i=.707106781,r=.707106781):(n=Math.sqrt(p),i=S/n,r=w/n):v>T?v<.01?(n=.707106781,i=0,r=.707106781):(i=Math.sqrt(v),n=S/i,r=L/i):T<.01?(n=.707106781,i=.707106781,r=0):(r=Math.sqrt(T),n=w/r,i=L/r),this.set(n,i,r,t),this}let _=Math.sqrt((g-x)*(g-x)+(u-y)*(u-y)+(f-h)*(f-h));return Math.abs(_)<.001&&(_=1),this.x=(g-x)/_,this.y=(u-y)/_,this.z=(f-h)/_,this.w=Math.acos((l+d+m-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Ke(this.x,e.x,t.x),this.y=Ke(this.y,e.y,t.y),this.z=Ke(this.z,e.z,t.z),this.w=Ke(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Ke(this.x,e,t),this.y=Ke(this.y,e,t),this.z=Ke(this.z,e,t),this.w=Ke(this.w,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Ke(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class ef extends ns{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:zt,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new ot(0,0,e,t),this.scissorTest=!1,this.viewport=new ot(0,0,e,t);const i={width:e,height:t,depth:n.depth},r=new Rt(i);this.textures=[];const o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){const t={minFilter:zt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let i=0,r=this.textures.length;i<r;i++)this.textures[i].image.width=e,this.textures[i].image.height=t,this.textures[i].image.depth=n,this.textures[i].isData3DTexture!==!0&&(this.textures[i].isArrayTexture=this.textures[i].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const i=Object.assign({},e.textures[t].image);this.textures[t].source=new Ja(i)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class xi extends ef{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class Th extends Rt{constructor(e=null,t=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=Vt,this.minFilter=Vt,this.wrapR=bn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class tf extends Rt{constructor(e=null,t=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=Vt,this.minFilter=Vt,this.wrapR=bn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Wn{constructor(e=new I(1/0,1/0,1/0),t=new I(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(hn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(hn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=hn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,hn):hn.fromBufferAttribute(r,o),hn.applyMatrix4(e.matrixWorld),this.expandByPoint(hn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),js.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),js.copy(n.boundingBox)),js.applyMatrix4(e.matrixWorld),this.union(js)}const i=e.children;for(let r=0,o=i.length;r<o;r++)this.expandByObject(i[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,hn),hn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(ls),Js.subVectors(this.max,ls),Mi.subVectors(e.a,ls),bi.subVectors(e.b,ls),Si.subVectors(e.c,ls),Xn.subVectors(bi,Mi),qn.subVectors(Si,bi),ri.subVectors(Mi,Si);let t=[0,-Xn.z,Xn.y,0,-qn.z,qn.y,0,-ri.z,ri.y,Xn.z,0,-Xn.x,qn.z,0,-qn.x,ri.z,0,-ri.x,-Xn.y,Xn.x,0,-qn.y,qn.x,0,-ri.y,ri.x,0];return!so(t,Mi,bi,Si,Js)||(t=[1,0,0,0,1,0,0,0,1],!so(t,Mi,bi,Si,Js))?!1:(Zs.crossVectors(Xn,qn),t=[Zs.x,Zs.y,Zs.z],so(t,Mi,bi,Si,Js))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,hn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(hn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Cn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Cn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Cn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Cn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Cn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Cn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Cn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Cn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Cn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const Cn=[new I,new I,new I,new I,new I,new I,new I,new I],hn=new I,js=new Wn,Mi=new I,bi=new I,Si=new I,Xn=new I,qn=new I,ri=new I,ls=new I,Js=new I,Zs=new I,oi=new I;function so(s,e,t,n,i){for(let r=0,o=s.length-3;r<=o;r+=3){oi.fromArray(s,r);const a=i.x*Math.abs(oi.x)+i.y*Math.abs(oi.y)+i.z*Math.abs(oi.z),c=e.dot(oi),l=t.dot(oi),h=n.dot(oi);if(Math.max(-Math.max(c,l,h),Math.min(c,l,h))>a)return!1}return!0}const nf=new Wn,hs=new I,ro=new I;class An{constructor(e=new I,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):nf.setFromPoints(e).getCenter(n);let i=0;for(let r=0,o=e.length;r<o;r++)i=Math.max(i,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;hs.subVectors(e,this.center);const t=hs.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),i=(n-this.radius)*.5;this.center.addScaledVector(hs,i/n),this.radius+=i}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(ro.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(hs.copy(e.center).add(ro)),this.expandByPoint(hs.copy(e.center).sub(ro))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}const Pn=new I,oo=new I,Qs=new I,Yn=new I,ao=new I,er=new I,co=new I;class qs{constructor(e=new I,t=new I(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Pn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=Pn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Pn.copy(this.origin).addScaledVector(this.direction,t),Pn.distanceToSquared(e))}distanceSqToSegment(e,t,n,i){oo.copy(e).add(t).multiplyScalar(.5),Qs.copy(t).sub(e).normalize(),Yn.copy(this.origin).sub(oo);const r=e.distanceTo(t)*.5,o=-this.direction.dot(Qs),a=Yn.dot(this.direction),c=-Yn.dot(Qs),l=Yn.lengthSq(),h=Math.abs(1-o*o);let u,f,d,x;if(h>0)if(u=o*c-a,f=o*a-c,x=r*h,u>=0)if(f>=-x)if(f<=x){const y=1/h;u*=y,f*=y,d=u*(u+o*f+2*a)+f*(o*u+f+2*c)+l}else f=r,u=Math.max(0,-(o*f+a)),d=-u*u+f*(f+2*c)+l;else f=-r,u=Math.max(0,-(o*f+a)),d=-u*u+f*(f+2*c)+l;else f<=-x?(u=Math.max(0,-(-o*r+a)),f=u>0?-r:Math.min(Math.max(-r,-c),r),d=-u*u+f*(f+2*c)+l):f<=x?(u=0,f=Math.min(Math.max(-r,-c),r),d=f*(f+2*c)+l):(u=Math.max(0,-(o*r+a)),f=u>0?r:Math.min(Math.max(-r,-c),r),d=-u*u+f*(f+2*c)+l);else f=o>0?-r:r,u=Math.max(0,-(o*f+a)),d=-u*u+f*(f+2*c)+l;return n&&n.copy(this.origin).addScaledVector(this.direction,u),i&&i.copy(oo).addScaledVector(Qs,f),d}intersectSphere(e,t){Pn.subVectors(e.center,this.origin);const n=Pn.dot(this.direction),i=Pn.dot(Pn)-n*n,r=e.radius*e.radius;if(i>r)return null;const o=Math.sqrt(r-i),a=n-o,c=n+o;return c<0?null:a<0?this.at(c,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,i,r,o,a,c;const l=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,f=this.origin;return l>=0?(n=(e.min.x-f.x)*l,i=(e.max.x-f.x)*l):(n=(e.max.x-f.x)*l,i=(e.min.x-f.x)*l),h>=0?(r=(e.min.y-f.y)*h,o=(e.max.y-f.y)*h):(r=(e.max.y-f.y)*h,o=(e.min.y-f.y)*h),n>o||r>i||((r>n||isNaN(n))&&(n=r),(o<i||isNaN(i))&&(i=o),u>=0?(a=(e.min.z-f.z)*u,c=(e.max.z-f.z)*u):(a=(e.max.z-f.z)*u,c=(e.min.z-f.z)*u),n>c||a>i)||((a>n||n!==n)&&(n=a),(c<i||i!==i)&&(i=c),i<0)?null:this.at(n>=0?n:i,t)}intersectsBox(e){return this.intersectBox(e,Pn)!==null}intersectTriangle(e,t,n,i,r){ao.subVectors(t,e),er.subVectors(n,e),co.crossVectors(ao,er);let o=this.direction.dot(co),a;if(o>0){if(i)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Yn.subVectors(this.origin,e);const c=a*this.direction.dot(er.crossVectors(Yn,er));if(c<0)return null;const l=a*this.direction.dot(ao.cross(Yn));if(l<0||c+l>o)return null;const h=-a*Yn.dot(co);return h<0?null:this.at(h/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class We{constructor(e,t,n,i,r,o,a,c,l,h,u,f,d,x,y,g){We.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,i,r,o,a,c,l,h,u,f,d,x,y,g)}set(e,t,n,i,r,o,a,c,l,h,u,f,d,x,y,g){const m=this.elements;return m[0]=e,m[4]=t,m[8]=n,m[12]=i,m[1]=r,m[5]=o,m[9]=a,m[13]=c,m[2]=l,m[6]=h,m[10]=u,m[14]=f,m[3]=d,m[7]=x,m[11]=y,m[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new We().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,n=e.elements,i=1/Ti.setFromMatrixColumn(e,0).length(),r=1/Ti.setFromMatrixColumn(e,1).length(),o=1/Ti.setFromMatrixColumn(e,2).length();return t[0]=n[0]*i,t[1]=n[1]*i,t[2]=n[2]*i,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,i=e.y,r=e.z,o=Math.cos(n),a=Math.sin(n),c=Math.cos(i),l=Math.sin(i),h=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){const f=o*h,d=o*u,x=a*h,y=a*u;t[0]=c*h,t[4]=-c*u,t[8]=l,t[1]=d+x*l,t[5]=f-y*l,t[9]=-a*c,t[2]=y-f*l,t[6]=x+d*l,t[10]=o*c}else if(e.order==="YXZ"){const f=c*h,d=c*u,x=l*h,y=l*u;t[0]=f+y*a,t[4]=x*a-d,t[8]=o*l,t[1]=o*u,t[5]=o*h,t[9]=-a,t[2]=d*a-x,t[6]=y+f*a,t[10]=o*c}else if(e.order==="ZXY"){const f=c*h,d=c*u,x=l*h,y=l*u;t[0]=f-y*a,t[4]=-o*u,t[8]=x+d*a,t[1]=d+x*a,t[5]=o*h,t[9]=y-f*a,t[2]=-o*l,t[6]=a,t[10]=o*c}else if(e.order==="ZYX"){const f=o*h,d=o*u,x=a*h,y=a*u;t[0]=c*h,t[4]=x*l-d,t[8]=f*l+y,t[1]=c*u,t[5]=y*l+f,t[9]=d*l-x,t[2]=-l,t[6]=a*c,t[10]=o*c}else if(e.order==="YZX"){const f=o*c,d=o*l,x=a*c,y=a*l;t[0]=c*h,t[4]=y-f*u,t[8]=x*u+d,t[1]=u,t[5]=o*h,t[9]=-a*h,t[2]=-l*h,t[6]=d*u+x,t[10]=f-y*u}else if(e.order==="XZY"){const f=o*c,d=o*l,x=a*c,y=a*l;t[0]=c*h,t[4]=-u,t[8]=l*h,t[1]=f*u+y,t[5]=o*h,t[9]=d*u-x,t[2]=x*u-d,t[6]=a*h,t[10]=y*u+f}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(sf,e,rf)}lookAt(e,t,n){const i=this.elements;return jt.subVectors(e,t),jt.lengthSq()===0&&(jt.z=1),jt.normalize(),$n.crossVectors(n,jt),$n.lengthSq()===0&&(Math.abs(n.z)===1?jt.x+=1e-4:jt.z+=1e-4,jt.normalize(),$n.crossVectors(n,jt)),$n.normalize(),tr.crossVectors(jt,$n),i[0]=$n.x,i[4]=tr.x,i[8]=jt.x,i[1]=$n.y,i[5]=tr.y,i[9]=jt.y,i[2]=$n.z,i[6]=tr.z,i[10]=jt.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,r=this.elements,o=n[0],a=n[4],c=n[8],l=n[12],h=n[1],u=n[5],f=n[9],d=n[13],x=n[2],y=n[6],g=n[10],m=n[14],_=n[3],p=n[7],v=n[11],T=n[15],S=i[0],w=i[4],L=i[8],b=i[12],M=i[1],C=i[5],D=i[9],F=i[13],k=i[2],z=i[6],V=i[10],Y=i[14],G=i[3],ne=i[7],oe=i[11],Ae=i[15];return r[0]=o*S+a*M+c*k+l*G,r[4]=o*w+a*C+c*z+l*ne,r[8]=o*L+a*D+c*V+l*oe,r[12]=o*b+a*F+c*Y+l*Ae,r[1]=h*S+u*M+f*k+d*G,r[5]=h*w+u*C+f*z+d*ne,r[9]=h*L+u*D+f*V+d*oe,r[13]=h*b+u*F+f*Y+d*Ae,r[2]=x*S+y*M+g*k+m*G,r[6]=x*w+y*C+g*z+m*ne,r[10]=x*L+y*D+g*V+m*oe,r[14]=x*b+y*F+g*Y+m*Ae,r[3]=_*S+p*M+v*k+T*G,r[7]=_*w+p*C+v*z+T*ne,r[11]=_*L+p*D+v*V+T*oe,r[15]=_*b+p*F+v*Y+T*Ae,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],i=e[8],r=e[12],o=e[1],a=e[5],c=e[9],l=e[13],h=e[2],u=e[6],f=e[10],d=e[14],x=e[3],y=e[7],g=e[11],m=e[15];return x*(+r*c*u-i*l*u-r*a*f+n*l*f+i*a*d-n*c*d)+y*(+t*c*d-t*l*f+r*o*f-i*o*d+i*l*h-r*c*h)+g*(+t*l*u-t*a*d-r*o*u+n*o*d+r*a*h-n*l*h)+m*(-i*a*h-t*c*u+t*a*f+i*o*u-n*o*f+n*c*h)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const i=this.elements;return e.isVector3?(i[12]=e.x,i[13]=e.y,i[14]=e.z):(i[12]=e,i[13]=t,i[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],h=e[8],u=e[9],f=e[10],d=e[11],x=e[12],y=e[13],g=e[14],m=e[15],_=u*g*l-y*f*l+y*c*d-a*g*d-u*c*m+a*f*m,p=x*f*l-h*g*l-x*c*d+o*g*d+h*c*m-o*f*m,v=h*y*l-x*u*l+x*a*d-o*y*d-h*a*m+o*u*m,T=x*u*c-h*y*c-x*a*f+o*y*f+h*a*g-o*u*g,S=t*_+n*p+i*v+r*T;if(S===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const w=1/S;return e[0]=_*w,e[1]=(y*f*r-u*g*r-y*i*d+n*g*d+u*i*m-n*f*m)*w,e[2]=(a*g*r-y*c*r+y*i*l-n*g*l-a*i*m+n*c*m)*w,e[3]=(u*c*r-a*f*r-u*i*l+n*f*l+a*i*d-n*c*d)*w,e[4]=p*w,e[5]=(h*g*r-x*f*r+x*i*d-t*g*d-h*i*m+t*f*m)*w,e[6]=(x*c*r-o*g*r-x*i*l+t*g*l+o*i*m-t*c*m)*w,e[7]=(o*f*r-h*c*r+h*i*l-t*f*l-o*i*d+t*c*d)*w,e[8]=v*w,e[9]=(x*u*r-h*y*r-x*n*d+t*y*d+h*n*m-t*u*m)*w,e[10]=(o*y*r-x*a*r+x*n*l-t*y*l-o*n*m+t*a*m)*w,e[11]=(h*a*r-o*u*r-h*n*l+t*u*l+o*n*d-t*a*d)*w,e[12]=T*w,e[13]=(h*y*i-x*u*i+x*n*f-t*y*f-h*n*g+t*u*g)*w,e[14]=(x*a*i-o*y*i-x*n*c+t*y*c+o*n*g-t*a*g)*w,e[15]=(o*u*i-h*a*i+h*n*c-t*u*c-o*n*f+t*a*f)*w,this}scale(e){const t=this.elements,n=e.x,i=e.y,r=e.z;return t[0]*=n,t[4]*=i,t[8]*=r,t[1]*=n,t[5]*=i,t[9]*=r,t[2]*=n,t[6]*=i,t[10]*=r,t[3]*=n,t[7]*=i,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],i=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,i))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),i=Math.sin(t),r=1-n,o=e.x,a=e.y,c=e.z,l=r*o,h=r*a;return this.set(l*o+n,l*a-i*c,l*c+i*a,0,l*a+i*c,h*a+n,h*c-i*o,0,l*c-i*a,h*c+i*o,r*c*c+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,i,r,o){return this.set(1,n,r,0,e,1,o,0,t,i,1,0,0,0,0,1),this}compose(e,t,n){const i=this.elements,r=t._x,o=t._y,a=t._z,c=t._w,l=r+r,h=o+o,u=a+a,f=r*l,d=r*h,x=r*u,y=o*h,g=o*u,m=a*u,_=c*l,p=c*h,v=c*u,T=n.x,S=n.y,w=n.z;return i[0]=(1-(y+m))*T,i[1]=(d+v)*T,i[2]=(x-p)*T,i[3]=0,i[4]=(d-v)*S,i[5]=(1-(f+m))*S,i[6]=(g+_)*S,i[7]=0,i[8]=(x+p)*w,i[9]=(g-_)*w,i[10]=(1-(f+y))*w,i[11]=0,i[12]=e.x,i[13]=e.y,i[14]=e.z,i[15]=1,this}decompose(e,t,n){const i=this.elements;let r=Ti.set(i[0],i[1],i[2]).length();const o=Ti.set(i[4],i[5],i[6]).length(),a=Ti.set(i[8],i[9],i[10]).length();this.determinant()<0&&(r=-r),e.x=i[12],e.y=i[13],e.z=i[14],un.copy(this);const l=1/r,h=1/o,u=1/a;return un.elements[0]*=l,un.elements[1]*=l,un.elements[2]*=l,un.elements[4]*=h,un.elements[5]*=h,un.elements[6]*=h,un.elements[8]*=u,un.elements[9]*=u,un.elements[10]*=u,t.setFromRotationMatrix(un),n.x=r,n.y=o,n.z=a,this}makePerspective(e,t,n,i,r,o,a=Sn,c=!1){const l=this.elements,h=2*r/(t-e),u=2*r/(n-i),f=(t+e)/(t-e),d=(n+i)/(n-i);let x,y;if(c)x=r/(o-r),y=o*r/(o-r);else if(a===Sn)x=-(o+r)/(o-r),y=-2*o*r/(o-r);else if(a===Br)x=-o/(o-r),y=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=h,l[4]=0,l[8]=f,l[12]=0,l[1]=0,l[5]=u,l[9]=d,l[13]=0,l[2]=0,l[6]=0,l[10]=x,l[14]=y,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,i,r,o,a=Sn,c=!1){const l=this.elements,h=2/(t-e),u=2/(n-i),f=-(t+e)/(t-e),d=-(n+i)/(n-i);let x,y;if(c)x=1/(o-r),y=o/(o-r);else if(a===Sn)x=-2/(o-r),y=-(o+r)/(o-r);else if(a===Br)x=-1/(o-r),y=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=h,l[4]=0,l[8]=0,l[12]=f,l[1]=0,l[5]=u,l[9]=0,l[13]=d,l[2]=0,l[6]=0,l[10]=x,l[14]=y,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<16;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const Ti=new I,un=new We,sf=new I(0,0,0),rf=new I(1,1,1),$n=new I,tr=new I,jt=new I,Oc=new We,Bc=new ni;class En{constructor(e=0,t=0,n=0,i=En.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,i=this._order){return this._x=e,this._y=t,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const i=e.elements,r=i[0],o=i[4],a=i[8],c=i[1],l=i[5],h=i[9],u=i[2],f=i[6],d=i[10];switch(t){case"XYZ":this._y=Math.asin(Ke(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,d),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(f,l),this._z=0);break;case"YXZ":this._x=Math.asin(-Ke(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,d),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(Ke(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-u,d),this._z=Math.atan2(-o,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-Ke(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(f,d),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-o,l));break;case"YZX":this._z=Math.asin(Ke(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-h,l),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(a,d));break;case"XZY":this._z=Math.asin(-Ke(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(f,l),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,d),this._y=0);break;default:Pe("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Oc.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Oc,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Bc.setFromEuler(this),this.setFromQuaternion(Bc,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}En.DEFAULT_ORDER="XYZ";class Za{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let of=0;const zc=new I,Ei=new ni,Ln=new We,nr=new I,us=new I,af=new I,cf=new ni,kc=new I(1,0,0),Vc=new I(0,1,0),Gc=new I(0,0,1),Hc={type:"added"},lf={type:"removed"},Ai={type:"childadded",child:null},lo={type:"childremoved",child:null};class gt extends ns{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:of++}),this.uuid=cn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=gt.DEFAULT_UP.clone();const e=new I,t=new En,n=new ni,i=new I(1,1,1);function r(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new We},normalMatrix:{value:new Xe}}),this.matrix=new We,this.matrixWorld=new We,this.matrixAutoUpdate=gt.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=gt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Za,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Ei.setFromAxisAngle(e,t),this.quaternion.multiply(Ei),this}rotateOnWorldAxis(e,t){return Ei.setFromAxisAngle(e,t),this.quaternion.premultiply(Ei),this}rotateX(e){return this.rotateOnAxis(kc,e)}rotateY(e){return this.rotateOnAxis(Vc,e)}rotateZ(e){return this.rotateOnAxis(Gc,e)}translateOnAxis(e,t){return zc.copy(e).applyQuaternion(this.quaternion),this.position.add(zc.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(kc,e)}translateY(e){return this.translateOnAxis(Vc,e)}translateZ(e){return this.translateOnAxis(Gc,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Ln.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?nr.copy(e):nr.set(e,t,n);const i=this.parent;this.updateWorldMatrix(!0,!1),us.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Ln.lookAt(us,nr,this.up):Ln.lookAt(nr,us,this.up),this.quaternion.setFromRotationMatrix(Ln),i&&(Ln.extractRotation(i.matrixWorld),Ei.setFromRotationMatrix(Ln),this.quaternion.premultiply(Ei.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?($e("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Hc),Ai.child=e,this.dispatchEvent(Ai),Ai.child=null):$e("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(lf),lo.child=e,this.dispatchEvent(lo),lo.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Ln.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Ln.multiply(e.parent.matrixWorld)),e.applyMatrix4(Ln),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Hc),Ai.child=e,this.dispatchEvent(Ai),Ai.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,i=this.children.length;n<i;n++){const o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const i=this.children;for(let r=0,o=i.length;r<o;r++)i[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(us,e,af),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(us,cf,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const i=this.children;for(let r=0,o=i.length;r<o;r++)i[r].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const i={};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),i.instanceInfo=this._instanceInfo.map(a=>({...a})),i.availableInstanceIds=this._availableInstanceIds.slice(),i.availableGeometryIds=this._availableGeometryIds.slice(),i.nextIndexStart=this._nextIndexStart,i.nextVertexStart=this._nextVertexStart,i.geometryCount=this._geometryCount,i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.matricesTexture=this._matricesTexture.toJSON(e),i.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(i.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(i.boundingBox=this.boundingBox.toJSON()));function r(a,c){return a[c.uuid]===void 0&&(a[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=r(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const c=a.shapes;if(Array.isArray(c))for(let l=0,h=c.length;l<h;l++){const u=c[l];r(e.shapes,u)}else r(e.shapes,c)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let c=0,l=this.material.length;c<l;c++)a.push(r(e.materials,this.material[c]));i.material=a}else i.material=r(e.materials,this.material);if(this.children.length>0){i.children=[];for(let a=0;a<this.children.length;a++)i.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){i.animations=[];for(let a=0;a<this.animations.length;a++){const c=this.animations[a];i.animations.push(r(e.animations,c))}}if(t){const a=o(e.geometries),c=o(e.materials),l=o(e.textures),h=o(e.images),u=o(e.shapes),f=o(e.skeletons),d=o(e.animations),x=o(e.nodes);a.length>0&&(n.geometries=a),c.length>0&&(n.materials=c),l.length>0&&(n.textures=l),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),f.length>0&&(n.skeletons=f),d.length>0&&(n.animations=d),x.length>0&&(n.nodes=x)}return n.object=i,n;function o(a){const c=[];for(const l in a){const h=a[l];delete h.metadata,c.push(h)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const i=e.children[n];this.add(i.clone())}return this}}gt.DEFAULT_UP=new I(0,1,0);gt.DEFAULT_MATRIX_AUTO_UPDATE=!0;gt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const dn=new I,In=new I,ho=new I,Dn=new I,wi=new I,Ri=new I,Wc=new I,uo=new I,fo=new I,po=new I,mo=new ot,xo=new ot,go=new ot;class rn{constructor(e=new I,t=new I,n=new I){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,i){i.subVectors(n,t),dn.subVectors(e,t),i.cross(dn);const r=i.lengthSq();return r>0?i.multiplyScalar(1/Math.sqrt(r)):i.set(0,0,0)}static getBarycoord(e,t,n,i,r){dn.subVectors(i,t),In.subVectors(n,t),ho.subVectors(e,t);const o=dn.dot(dn),a=dn.dot(In),c=dn.dot(ho),l=In.dot(In),h=In.dot(ho),u=o*l-a*a;if(u===0)return r.set(0,0,0),null;const f=1/u,d=(l*c-a*h)*f,x=(o*h-a*c)*f;return r.set(1-d-x,x,d)}static containsPoint(e,t,n,i){return this.getBarycoord(e,t,n,i,Dn)===null?!1:Dn.x>=0&&Dn.y>=0&&Dn.x+Dn.y<=1}static getInterpolation(e,t,n,i,r,o,a,c){return this.getBarycoord(e,t,n,i,Dn)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,Dn.x),c.addScaledVector(o,Dn.y),c.addScaledVector(a,Dn.z),c)}static getInterpolatedAttribute(e,t,n,i,r,o){return mo.setScalar(0),xo.setScalar(0),go.setScalar(0),mo.fromBufferAttribute(e,t),xo.fromBufferAttribute(e,n),go.fromBufferAttribute(e,i),o.setScalar(0),o.addScaledVector(mo,r.x),o.addScaledVector(xo,r.y),o.addScaledVector(go,r.z),o}static isFrontFacing(e,t,n,i){return dn.subVectors(n,t),In.subVectors(e,t),dn.cross(In).dot(i)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,i){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[i]),this}setFromAttributeAndIndices(e,t,n,i){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,i),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return dn.subVectors(this.c,this.b),In.subVectors(this.a,this.b),dn.cross(In).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return rn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return rn.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,i,r){return rn.getInterpolation(e,this.a,this.b,this.c,t,n,i,r)}containsPoint(e){return rn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return rn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,i=this.b,r=this.c;let o,a;wi.subVectors(i,n),Ri.subVectors(r,n),uo.subVectors(e,n);const c=wi.dot(uo),l=Ri.dot(uo);if(c<=0&&l<=0)return t.copy(n);fo.subVectors(e,i);const h=wi.dot(fo),u=Ri.dot(fo);if(h>=0&&u<=h)return t.copy(i);const f=c*u-h*l;if(f<=0&&c>=0&&h<=0)return o=c/(c-h),t.copy(n).addScaledVector(wi,o);po.subVectors(e,r);const d=wi.dot(po),x=Ri.dot(po);if(x>=0&&d<=x)return t.copy(r);const y=d*l-c*x;if(y<=0&&l>=0&&x<=0)return a=l/(l-x),t.copy(n).addScaledVector(Ri,a);const g=h*x-d*u;if(g<=0&&u-h>=0&&d-x>=0)return Wc.subVectors(r,i),a=(u-h)/(u-h+(d-x)),t.copy(i).addScaledVector(Wc,a);const m=1/(g+y+f);return o=y*m,a=f*m,t.copy(n).addScaledVector(wi,o).addScaledVector(Ri,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const Eh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Kn={h:0,s:0,l:0},ir={h:0,s:0,l:0};function _o(s,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?s+(e-s)*6*t:t<1/2?e:t<2/3?s+(e-s)*6*(2/3-t):s}class Ve{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const i=e;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=wt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,nt.colorSpaceToWorking(this,t),this}setRGB(e,t,n,i=nt.workingColorSpace){return this.r=e,this.g=t,this.b=n,nt.colorSpaceToWorking(this,i),this}setHSL(e,t,n,i=nt.workingColorSpace){if(e=ja(e,1),t=Ke(t,0,1),n=Ke(n,0,1),t===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+t):n+t-n*t,o=2*n-r;this.r=_o(o,r,e+1/3),this.g=_o(o,r,e),this.b=_o(o,r,e-1/3)}return nt.colorSpaceToWorking(this,i),this}setStyle(e,t=wt){function n(r){r!==void 0&&parseFloat(r)<1&&Pe("Color: Alpha component of "+e+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const o=i[1],a=i[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Pe("Color: Unknown color model "+e)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=i[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);Pe("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=wt){const n=Eh[e.toLowerCase()];return n!==void 0?this.setHex(n,t):Pe("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Vn(e.r),this.g=Vn(e.g),this.b=Vn(e.b),this}copyLinearToSRGB(e){return this.r=Vi(e.r),this.g=Vi(e.g),this.b=Vi(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=wt){return nt.workingToColorSpace(Dt.copy(this),e),Math.round(Ke(Dt.r*255,0,255))*65536+Math.round(Ke(Dt.g*255,0,255))*256+Math.round(Ke(Dt.b*255,0,255))}getHexString(e=wt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=nt.workingColorSpace){nt.workingToColorSpace(Dt.copy(this),t);const n=Dt.r,i=Dt.g,r=Dt.b,o=Math.max(n,i,r),a=Math.min(n,i,r);let c,l;const h=(a+o)/2;if(a===o)c=0,l=0;else{const u=o-a;switch(l=h<=.5?u/(o+a):u/(2-o-a),o){case n:c=(i-r)/u+(i<r?6:0);break;case i:c=(r-n)/u+2;break;case r:c=(n-i)/u+4;break}c/=6}return e.h=c,e.s=l,e.l=h,e}getRGB(e,t=nt.workingColorSpace){return nt.workingToColorSpace(Dt.copy(this),t),e.r=Dt.r,e.g=Dt.g,e.b=Dt.b,e}getStyle(e=wt){nt.workingToColorSpace(Dt.copy(this),e);const t=Dt.r,n=Dt.g,i=Dt.b;return e!==wt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(e,t,n){return this.getHSL(Kn),this.setHSL(Kn.h+e,Kn.s+t,Kn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Kn),e.getHSL(ir);const n=ws(Kn.h,ir.h,t),i=ws(Kn.s,ir.s,t),r=ws(Kn.l,ir.l,t);return this.setHSL(n,i,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,i=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*i,this.g=r[1]*t+r[4]*n+r[7]*i,this.b=r[2]*t+r[5]*n+r[8]*i,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Dt=new Ve;Ve.NAMES=Eh;let hf=0;class xn extends ns{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:hf++}),this.uuid=cn(),this.name="",this.type="Material",this.blending=ki,this.side=Gn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Wo,this.blendDst=Xo,this.blendEquation=fi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ve(0,0,0),this.blendAlpha=0,this.depthFunc=Wi,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Pc,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=vi,this.stencilZFail=vi,this.stencilZPass=vi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){Pe(`Material: parameter '${t}' has value of undefined.`);continue}const i=this[t];if(i===void 0){Pe(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==ki&&(n.blending=this.blending),this.side!==Gn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Wo&&(n.blendSrc=this.blendSrc),this.blendDst!==Xo&&(n.blendDst=this.blendDst),this.blendEquation!==fi&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==Wi&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Pc&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==vi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==vi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==vi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(r){const o=[];for(const a in r){const c=r[a];delete c.metadata,o.push(c)}return o}if(t){const r=i(e.textures),o=i(e.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const i=t.length;n=new Array(i);for(let r=0;r!==i;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class Tt extends xn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ve(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new En,this.combine=uh,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const At=new I,sr=new te;let uf=0;class Ut{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:uf++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Pa,this.updateRanges=[],this.gpuType=mn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let i=0,r=this.itemSize;i<r;i++)this.array[e+i]=t.array[n+i];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)sr.fromBufferAttribute(this,t),sr.applyMatrix3(e),this.setXY(t,sr.x,sr.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)At.fromBufferAttribute(this,t),At.applyMatrix3(e),this.setXYZ(t,At.x,At.y,At.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)At.fromBufferAttribute(this,t),At.applyMatrix4(e),this.setXYZ(t,At.x,At.y,At.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)At.fromBufferAttribute(this,t),At.applyNormalMatrix(e),this.setXYZ(t,At.x,At.y,At.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)At.fromBufferAttribute(this,t),At.transformDirection(e),this.setXYZ(t,At.x,At.y,At.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=pn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=ct(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=pn(t,this.array)),t}setX(e,t){return this.normalized&&(t=ct(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=pn(t,this.array)),t}setY(e,t){return this.normalized&&(t=ct(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=pn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=ct(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=pn(t,this.array)),t}setW(e,t){return this.normalized&&(t=ct(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=ct(t,this.array),n=ct(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,i){return e*=this.itemSize,this.normalized&&(t=ct(t,this.array),n=ct(n,this.array),i=ct(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this}setXYZW(e,t,n,i,r){return e*=this.itemSize,this.normalized&&(t=ct(t,this.array),n=ct(n,this.array),i=ct(i,this.array),r=ct(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==Pa&&(e.usage=this.usage),e}}class Ah extends Ut{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class wh extends Ut{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class qe extends Ut{constructor(e,t,n){super(new Float32Array(e),t,n)}}let df=0;const en=new We,vo=new gt,Ci=new I,Jt=new Wn,ds=new Wn,Lt=new I;class _t extends ns{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:df++}),this.uuid=cn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Sh(e)?wh:Ah)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Xe().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}const i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(e),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return en.makeRotationFromQuaternion(e),this.applyMatrix4(en),this}rotateX(e){return en.makeRotationX(e),this.applyMatrix4(en),this}rotateY(e){return en.makeRotationY(e),this.applyMatrix4(en),this}rotateZ(e){return en.makeRotationZ(e),this.applyMatrix4(en),this}translate(e,t,n){return en.makeTranslation(e,t,n),this.applyMatrix4(en),this}scale(e,t,n){return en.makeScale(e,t,n),this.applyMatrix4(en),this}lookAt(e){return vo.lookAt(e),vo.updateMatrix(),this.applyMatrix4(vo.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ci).negate(),this.translate(Ci.x,Ci.y,Ci.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let i=0,r=e.length;i<r;i++){const o=e[i];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new qe(n,3))}else{const n=Math.min(e.length,t.count);for(let i=0;i<n;i++){const r=e[i];t.setXYZ(i,r.x,r.y,r.z||0)}e.length>t.count&&Pe("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Wn);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){$e("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new I(-1/0,-1/0,-1/0),new I(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,i=t.length;n<i;n++){const r=t[n];Jt.setFromBufferAttribute(r),this.morphTargetsRelative?(Lt.addVectors(this.boundingBox.min,Jt.min),this.boundingBox.expandByPoint(Lt),Lt.addVectors(this.boundingBox.max,Jt.max),this.boundingBox.expandByPoint(Lt)):(this.boundingBox.expandByPoint(Jt.min),this.boundingBox.expandByPoint(Jt.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&$e('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new An);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){$e("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new I,1/0);return}if(e){const n=this.boundingSphere.center;if(Jt.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){const a=t[r];ds.setFromBufferAttribute(a),this.morphTargetsRelative?(Lt.addVectors(Jt.min,ds.min),Jt.expandByPoint(Lt),Lt.addVectors(Jt.max,ds.max),Jt.expandByPoint(Lt)):(Jt.expandByPoint(ds.min),Jt.expandByPoint(ds.max))}Jt.getCenter(n);let i=0;for(let r=0,o=e.count;r<o;r++)Lt.fromBufferAttribute(e,r),i=Math.max(i,n.distanceToSquared(Lt));if(t)for(let r=0,o=t.length;r<o;r++){const a=t[r],c=this.morphTargetsRelative;for(let l=0,h=a.count;l<h;l++)Lt.fromBufferAttribute(a,l),c&&(Ci.fromBufferAttribute(e,l),Lt.add(Ci)),i=Math.max(i,n.distanceToSquared(Lt))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&$e('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){$e("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,i=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Ut(new Float32Array(4*n.count),4));const o=this.getAttribute("tangent"),a=[],c=[];for(let L=0;L<n.count;L++)a[L]=new I,c[L]=new I;const l=new I,h=new I,u=new I,f=new te,d=new te,x=new te,y=new I,g=new I;function m(L,b,M){l.fromBufferAttribute(n,L),h.fromBufferAttribute(n,b),u.fromBufferAttribute(n,M),f.fromBufferAttribute(r,L),d.fromBufferAttribute(r,b),x.fromBufferAttribute(r,M),h.sub(l),u.sub(l),d.sub(f),x.sub(f);const C=1/(d.x*x.y-x.x*d.y);isFinite(C)&&(y.copy(h).multiplyScalar(x.y).addScaledVector(u,-d.y).multiplyScalar(C),g.copy(u).multiplyScalar(d.x).addScaledVector(h,-x.x).multiplyScalar(C),a[L].add(y),a[b].add(y),a[M].add(y),c[L].add(g),c[b].add(g),c[M].add(g))}let _=this.groups;_.length===0&&(_=[{start:0,count:e.count}]);for(let L=0,b=_.length;L<b;++L){const M=_[L],C=M.start,D=M.count;for(let F=C,k=C+D;F<k;F+=3)m(e.getX(F+0),e.getX(F+1),e.getX(F+2))}const p=new I,v=new I,T=new I,S=new I;function w(L){T.fromBufferAttribute(i,L),S.copy(T);const b=a[L];p.copy(b),p.sub(T.multiplyScalar(T.dot(b))).normalize(),v.crossVectors(S,b);const C=v.dot(c[L])<0?-1:1;o.setXYZW(L,p.x,p.y,p.z,C)}for(let L=0,b=_.length;L<b;++L){const M=_[L],C=M.start,D=M.count;for(let F=C,k=C+D;F<k;F+=3)w(e.getX(F+0)),w(e.getX(F+1)),w(e.getX(F+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Ut(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let f=0,d=n.count;f<d;f++)n.setXYZ(f,0,0,0);const i=new I,r=new I,o=new I,a=new I,c=new I,l=new I,h=new I,u=new I;if(e)for(let f=0,d=e.count;f<d;f+=3){const x=e.getX(f+0),y=e.getX(f+1),g=e.getX(f+2);i.fromBufferAttribute(t,x),r.fromBufferAttribute(t,y),o.fromBufferAttribute(t,g),h.subVectors(o,r),u.subVectors(i,r),h.cross(u),a.fromBufferAttribute(n,x),c.fromBufferAttribute(n,y),l.fromBufferAttribute(n,g),a.add(h),c.add(h),l.add(h),n.setXYZ(x,a.x,a.y,a.z),n.setXYZ(y,c.x,c.y,c.z),n.setXYZ(g,l.x,l.y,l.z)}else for(let f=0,d=t.count;f<d;f+=3)i.fromBufferAttribute(t,f+0),r.fromBufferAttribute(t,f+1),o.fromBufferAttribute(t,f+2),h.subVectors(o,r),u.subVectors(i,r),h.cross(u),n.setXYZ(f+0,h.x,h.y,h.z),n.setXYZ(f+1,h.x,h.y,h.z),n.setXYZ(f+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Lt.fromBufferAttribute(e,t),Lt.normalize(),e.setXYZ(t,Lt.x,Lt.y,Lt.z)}toNonIndexed(){function e(a,c){const l=a.array,h=a.itemSize,u=a.normalized,f=new l.constructor(c.length*h);let d=0,x=0;for(let y=0,g=c.length;y<g;y++){a.isInterleavedBufferAttribute?d=c[y]*a.data.stride+a.offset:d=c[y]*h;for(let m=0;m<h;m++)f[x++]=l[d++]}return new Ut(f,h,u)}if(this.index===null)return Pe("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new _t,n=this.index.array,i=this.attributes;for(const a in i){const c=i[a],l=e(c,n);t.setAttribute(a,l)}const r=this.morphAttributes;for(const a in r){const c=[],l=r[a];for(let h=0,u=l.length;h<u;h++){const f=l[h],d=e(f,n);c.push(d)}t.morphAttributes[a]=c}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,c=o.length;a<c;a++){const l=o[a];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const c=this.parameters;for(const l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const c in n){const l=n[c];e.data.attributes[c]=l.toJSON(e.data)}const i={};let r=!1;for(const c in this.morphAttributes){const l=this.morphAttributes[c],h=[];for(let u=0,f=l.length;u<f;u++){const d=l[u];h.push(d.toJSON(e.data))}h.length>0&&(i[c]=h,r=!0)}r&&(e.data.morphAttributes=i,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone());const i=e.attributes;for(const l in i){const h=i[l];this.setAttribute(l,h.clone(t))}const r=e.morphAttributes;for(const l in r){const h=[],u=r[l];for(let f=0,d=u.length;f<d;f++)h.push(u[f].clone(t));this.morphAttributes[l]=h}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let l=0,h=o.length;l<h;l++){const u=o[l];this.addGroup(u.start,u.count,u.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Xc=new We,ai=new qs,rr=new An,qc=new I,or=new I,ar=new I,cr=new I,yo=new I,lr=new I,Yc=new I,hr=new I;class Ze extends gt{constructor(e=new _t,t=new Tt){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){const a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){const n=this.geometry,i=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(i,e);const a=this.morphTargetInfluences;if(r&&a){lr.set(0,0,0);for(let c=0,l=r.length;c<l;c++){const h=a[c],u=r[c];h!==0&&(yo.fromBufferAttribute(u,e),o?lr.addScaledVector(yo,h):lr.addScaledVector(yo.sub(t),h))}t.add(lr)}return t}raycast(e,t){const n=this.geometry,i=this.material,r=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),rr.copy(n.boundingSphere),rr.applyMatrix4(r),ai.copy(e.ray).recast(e.near),!(rr.containsPoint(ai.origin)===!1&&(ai.intersectSphere(rr,qc)===null||ai.origin.distanceToSquared(qc)>(e.far-e.near)**2))&&(Xc.copy(r).invert(),ai.copy(e.ray).applyMatrix4(Xc),!(n.boundingBox!==null&&ai.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,ai)))}_computeIntersections(e,t,n){let i;const r=this.geometry,o=this.material,a=r.index,c=r.attributes.position,l=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,f=r.groups,d=r.drawRange;if(a!==null)if(Array.isArray(o))for(let x=0,y=f.length;x<y;x++){const g=f[x],m=o[g.materialIndex],_=Math.max(g.start,d.start),p=Math.min(a.count,Math.min(g.start+g.count,d.start+d.count));for(let v=_,T=p;v<T;v+=3){const S=a.getX(v),w=a.getX(v+1),L=a.getX(v+2);i=ur(this,m,e,n,l,h,u,S,w,L),i&&(i.faceIndex=Math.floor(v/3),i.face.materialIndex=g.materialIndex,t.push(i))}}else{const x=Math.max(0,d.start),y=Math.min(a.count,d.start+d.count);for(let g=x,m=y;g<m;g+=3){const _=a.getX(g),p=a.getX(g+1),v=a.getX(g+2);i=ur(this,o,e,n,l,h,u,_,p,v),i&&(i.faceIndex=Math.floor(g/3),t.push(i))}}else if(c!==void 0)if(Array.isArray(o))for(let x=0,y=f.length;x<y;x++){const g=f[x],m=o[g.materialIndex],_=Math.max(g.start,d.start),p=Math.min(c.count,Math.min(g.start+g.count,d.start+d.count));for(let v=_,T=p;v<T;v+=3){const S=v,w=v+1,L=v+2;i=ur(this,m,e,n,l,h,u,S,w,L),i&&(i.faceIndex=Math.floor(v/3),i.face.materialIndex=g.materialIndex,t.push(i))}}else{const x=Math.max(0,d.start),y=Math.min(c.count,d.start+d.count);for(let g=x,m=y;g<m;g+=3){const _=g,p=g+1,v=g+2;i=ur(this,o,e,n,l,h,u,_,p,v),i&&(i.faceIndex=Math.floor(g/3),t.push(i))}}}}function ff(s,e,t,n,i,r,o,a){let c;if(e.side===qt?c=n.intersectTriangle(o,r,i,!0,a):c=n.intersectTriangle(i,r,o,e.side===Gn,a),c===null)return null;hr.copy(a),hr.applyMatrix4(s.matrixWorld);const l=t.ray.origin.distanceTo(hr);return l<t.near||l>t.far?null:{distance:l,point:hr.clone(),object:s}}function ur(s,e,t,n,i,r,o,a,c,l){s.getVertexPosition(a,or),s.getVertexPosition(c,ar),s.getVertexPosition(l,cr);const h=ff(s,e,t,n,or,ar,cr,Yc);if(h){const u=new I;rn.getBarycoord(Yc,or,ar,cr,u),i&&(h.uv=rn.getInterpolatedAttribute(i,a,c,l,u,new te)),r&&(h.uv1=rn.getInterpolatedAttribute(r,a,c,l,u,new te)),o&&(h.normal=rn.getInterpolatedAttribute(o,a,c,l,u,new I),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const f={a,b:c,c:l,normal:new I,materialIndex:0};rn.getNormal(or,ar,cr,f.normal),h.face=f,h.barycoord=u}return h}class Yt extends _t{constructor(e=1,t=1,n=1,i=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:i,heightSegments:r,depthSegments:o};const a=this;i=Math.floor(i),r=Math.floor(r),o=Math.floor(o);const c=[],l=[],h=[],u=[];let f=0,d=0;x("z","y","x",-1,-1,n,t,e,o,r,0),x("z","y","x",1,-1,n,t,-e,o,r,1),x("x","z","y",1,1,e,n,t,i,o,2),x("x","z","y",1,-1,e,n,-t,i,o,3),x("x","y","z",1,-1,e,t,n,i,r,4),x("x","y","z",-1,-1,e,t,-n,i,r,5),this.setIndex(c),this.setAttribute("position",new qe(l,3)),this.setAttribute("normal",new qe(h,3)),this.setAttribute("uv",new qe(u,2));function x(y,g,m,_,p,v,T,S,w,L,b){const M=v/w,C=T/L,D=v/2,F=T/2,k=S/2,z=w+1,V=L+1;let Y=0,G=0;const ne=new I;for(let oe=0;oe<V;oe++){const Ae=oe*C-F;for(let je=0;je<z;je++){const et=je*M-D;ne[y]=et*_,ne[g]=Ae*p,ne[m]=k,l.push(ne.x,ne.y,ne.z),ne[y]=0,ne[g]=0,ne[m]=S>0?1:-1,h.push(ne.x,ne.y,ne.z),u.push(je/w),u.push(1-oe/L),Y+=1}}for(let oe=0;oe<L;oe++)for(let Ae=0;Ae<w;Ae++){const je=f+Ae+z*oe,et=f+Ae+z*(oe+1),rt=f+(Ae+1)+z*(oe+1),at=f+(Ae+1)+z*oe;c.push(je,et,at),c.push(et,rt,at),G+=6}a.addGroup(d,G,b),d+=G,f+=Y}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Yt(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Ki(s){const e={};for(const t in s){e[t]={};for(const n in s[t]){const i=s[t][n];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(Pe("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=i.clone():Array.isArray(i)?e[t][n]=i.slice():e[t][n]=i}}return e}function Bt(s){const e={};for(let t=0;t<s.length;t++){const n=Ki(s[t]);for(const i in n)e[i]=n[i]}return e}function pf(s){const e=[];for(let t=0;t<s.length;t++)e.push(s[t].clone());return e}function Rh(s){const e=s.getRenderTarget();return e===null?s.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:nt.workingColorSpace}const mf={clone:Ki,merge:Bt};var xf=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,gf=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Hn extends xn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=xf,this.fragmentShader=gf,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ki(e.uniforms),this.uniformsGroups=pf(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const i in this.uniforms){const o=this.uniforms[i].value;o&&o.isTexture?t.uniforms[i]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[i]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[i]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[i]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[i]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[i]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[i]={type:"m4",value:o.toArray()}:t.uniforms[i]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class Ch extends gt{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new We,this.projectionMatrix=new We,this.projectionMatrixInverse=new We,this.coordinateSystem=Sn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const jn=new I,$c=new te,Kc=new te;class Xt extends Ch{constructor(e=50,t=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=$i*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(As*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return $i*2*Math.atan(Math.tan(As*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){jn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(jn.x,jn.y).multiplyScalar(-e/jn.z),jn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(jn.x,jn.y).multiplyScalar(-e/jn.z)}getViewSize(e,t){return this.getViewBounds(e,$c,Kc),t.subVectors(Kc,$c)}setViewOffset(e,t,n,i,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(As*.5*this.fov)/this.zoom,n=2*t,i=this.aspect*n,r=-.5*i;const o=this.view;if(this.view!==null&&this.view.enabled){const c=o.fullWidth,l=o.fullHeight;r+=o.offsetX*i/c,t-=o.offsetY*n/l,i*=o.width/c,n*=o.height/l}const a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+i,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const Pi=-90,Li=1;class _f extends gt{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const i=new Xt(Pi,Li,e,t);i.layers=this.layers,this.add(i);const r=new Xt(Pi,Li,e,t);r.layers=this.layers,this.add(r);const o=new Xt(Pi,Li,e,t);o.layers=this.layers,this.add(o);const a=new Xt(Pi,Li,e,t);a.layers=this.layers,this.add(a);const c=new Xt(Pi,Li,e,t);c.layers=this.layers,this.add(c);const l=new Xt(Pi,Li,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,i,r,o,a,c]=t;for(const l of t)this.remove(l);if(e===Sn)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===Br)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,o,a,c,l,h]=this.children,u=e.getRenderTarget(),f=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),x=e.xr.enabled;e.xr.enabled=!1;const y=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,i),e.render(t,r),e.setRenderTarget(n,1,i),e.render(t,o),e.setRenderTarget(n,2,i),e.render(t,a),e.setRenderTarget(n,3,i),e.render(t,c),e.setRenderTarget(n,4,i),e.render(t,l),n.texture.generateMipmaps=y,e.setRenderTarget(n,5,i),e.render(t,h),e.setRenderTarget(u,f,d),e.xr.enabled=x,n.texture.needsPMREMUpdate=!0}}class Ph extends Rt{constructor(e=[],t=Xi,n,i,r,o,a,c,l,h){super(e,t,n,i,r,o,a,c,l,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class vf extends xi{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},i=[n,n,n,n,n,n];this.texture=new Ph(i),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},i=new Yt(5,5,5),r=new Hn({name:"CubemapFromEquirect",uniforms:Ki(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:qt,blending:kn});r.uniforms.tEquirect.value=t;const o=new Ze(i,r),a=t.minFilter;return t.minFilter===On&&(t.minFilter=zt),new _f(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,n=!0,i=!0){const r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,i);e.setRenderTarget(r)}}class Ge extends gt{constructor(){super(),this.isGroup=!0,this.type="Group"}}const yf={type:"move"};class Mo{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ge,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ge,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new I,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new I),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ge,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new I,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new I),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let i=null,r=null,o=null;const a=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){o=!0;for(const y of e.hand.values()){const g=t.getJointPose(y,n),m=this._getHandJoint(l,y);g!==null&&(m.matrix.fromArray(g.transform.matrix),m.matrix.decompose(m.position,m.rotation,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=g.radius),m.visible=g!==null}const h=l.joints["index-finger-tip"],u=l.joints["thumb-tip"],f=h.position.distanceTo(u.position),d=.02,x=.005;l.inputState.pinching&&f>d+x?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&f<=d-x&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1));a!==null&&(i=t.getPose(e.targetRaySpace,n),i===null&&r!==null&&(i=r),i!==null&&(a.matrix.fromArray(i.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,i.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(i.linearVelocity)):a.hasLinearVelocity=!1,i.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(i.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(yf)))}return a!==null&&(a.visible=i!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new Ge;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}class Lh{constructor(e,t=1,n=1e3){this.isFog=!0,this.name="",this.color=new Ve(e),this.near=t,this.far=n}clone(){return new Lh(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class Wv extends gt{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new En,this.environmentIntensity=1,this.environmentRotation=new En,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class Ih{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=Pa,this.updateRanges=[],this.version=0,this.uuid=cn()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let i=0,r=this.stride;i<r;i++)this.array[e+i]=t.array[n+i];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=cn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=cn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const Ot=new I;class Gs{constructor(e,t,n,i=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=i}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)Ot.fromBufferAttribute(this,t),Ot.applyMatrix4(e),this.setXYZ(t,Ot.x,Ot.y,Ot.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Ot.fromBufferAttribute(this,t),Ot.applyNormalMatrix(e),this.setXYZ(t,Ot.x,Ot.y,Ot.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Ot.fromBufferAttribute(this,t),Ot.transformDirection(e),this.setXYZ(t,Ot.x,Ot.y,Ot.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=pn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=ct(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=ct(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=ct(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=ct(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=ct(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=pn(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=pn(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=pn(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=pn(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=ct(t,this.array),n=ct(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=ct(t,this.array),n=ct(n,this.array),i=ct(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this}setXYZW(e,t,n,i,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=ct(t,this.array),n=ct(n,this.array),i=ct(i,this.array),r=ct(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this.data.array[e+3]=r,this}clone(e){if(e===void 0){zr("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[i+r])}return new Ut(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new Gs(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){zr("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[i+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}class Qa extends xn{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Ve(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}let Ii;const fs=new I,Di=new I,Ni=new I,Ui=new te,ps=new te,Dh=new We,dr=new I,ms=new I,fr=new I,jc=new te,bo=new te,Jc=new te;class Nh extends gt{constructor(e=new Qa){if(super(),this.isSprite=!0,this.type="Sprite",Ii===void 0){Ii=new _t;const t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new Ih(t,5);Ii.setIndex([0,1,2,0,2,3]),Ii.setAttribute("position",new Gs(n,3,0,!1)),Ii.setAttribute("uv",new Gs(n,2,3,!1))}this.geometry=Ii,this.material=e,this.center=new te(.5,.5),this.count=1}raycast(e,t){e.camera===null&&$e('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Di.setFromMatrixScale(this.matrixWorld),Dh.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Ni.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Di.multiplyScalar(-Ni.z);const n=this.material.rotation;let i,r;n!==0&&(r=Math.cos(n),i=Math.sin(n));const o=this.center;pr(dr.set(-.5,-.5,0),Ni,o,Di,i,r),pr(ms.set(.5,-.5,0),Ni,o,Di,i,r),pr(fr.set(.5,.5,0),Ni,o,Di,i,r),jc.set(0,0),bo.set(1,0),Jc.set(1,1);let a=e.ray.intersectTriangle(dr,ms,fr,!1,fs);if(a===null&&(pr(ms.set(-.5,.5,0),Ni,o,Di,i,r),bo.set(0,1),a=e.ray.intersectTriangle(dr,fr,ms,!1,fs),a===null))return;const c=e.ray.origin.distanceTo(fs);c<e.near||c>e.far||t.push({distance:c,point:fs.clone(),uv:rn.getInterpolation(fs,dr,ms,fr,jc,bo,Jc,new te),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}}function pr(s,e,t,n,i,r){Ui.subVectors(s,t).addScalar(.5).multiply(n),i!==void 0?(ps.x=r*Ui.x-i*Ui.y,ps.y=i*Ui.x+r*Ui.y):ps.copy(Ui),s.copy(e),s.x+=ps.x,s.y+=ps.y,s.applyMatrix4(Dh)}const Zc=new I,Qc=new ot,el=new ot,Mf=new I,tl=new We,mr=new I,So=new An,nl=new We,To=new qs;class bf extends Ze{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=Ac,this.bindMatrix=new We,this.bindMatrixInverse=new We,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){const e=this.geometry;this.boundingBox===null&&(this.boundingBox=new Wn),this.boundingBox.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,mr),this.boundingBox.expandByPoint(mr)}computeBoundingSphere(){const e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new An),this.boundingSphere.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,mr),this.boundingSphere.expandByPoint(mr)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){const n=this.material,i=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),So.copy(this.boundingSphere),So.applyMatrix4(i),e.ray.intersectsSphere(So)!==!1&&(nl.copy(i).invert(),To.copy(e.ray).applyMatrix4(nl),!(this.boundingBox!==null&&To.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,To)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){const e=new ot,t=this.geometry.attributes.skinWeight;for(let n=0,i=t.count;n<i;n++){e.fromBufferAttribute(t,n);const r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===Ac?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===_d?this.bindMatrixInverse.copy(this.bindMatrix).invert():Pe("SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){const n=this.skeleton,i=this.geometry;Qc.fromBufferAttribute(i.attributes.skinIndex,e),el.fromBufferAttribute(i.attributes.skinWeight,e),Zc.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let r=0;r<4;r++){const o=el.getComponent(r);if(o!==0){const a=Qc.getComponent(r);tl.multiplyMatrices(n.bones[a].matrixWorld,n.boneInverses[a]),t.addScaledVector(Mf.copy(Zc).applyMatrix4(tl),o)}}return t.applyMatrix4(this.bindMatrixInverse)}}class Uh extends gt{constructor(){super(),this.isBone=!0,this.type="Bone"}}class ec extends Rt{constructor(e=null,t=1,n=1,i,r,o,a,c,l=Vt,h=Vt,u,f){super(null,o,a,c,l,h,i,r,u,f),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const il=new We,Sf=new We;class tc{constructor(e=[],t=[]){this.uuid=cn(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){const e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){Pe("Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,i=this.bones.length;n<i;n++)this.boneInverses.push(new We)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){const n=new We;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){const e=this.bones,t=this.boneInverses,n=this.boneMatrices,i=this.boneTexture;for(let r=0,o=e.length;r<o;r++){const a=e[r]?e[r].matrixWorld:Sf;il.multiplyMatrices(a,t[r]),il.toArray(n,r*16)}i!==null&&(i.needsUpdate=!0)}clone(){return new tc(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);const t=new Float32Array(e*e*4);t.set(this.boneMatrices);const n=new ec(t,e,e,an,mn);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){const i=this.bones[t];if(i.name===e)return i}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,i=e.bones.length;n<i;n++){const r=e.bones[n];let o=t[r];o===void 0&&(Pe("Skeleton: No bone found with UUID:",r),o=new Uh),this.bones.push(o),this.boneInverses.push(new We().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){const e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;const t=this.bones,n=this.boneInverses;for(let i=0,r=t.length;i<r;i++){const o=t[i];e.bones.push(o.uuid);const a=n[i];e.boneInverses.push(a.toArray())}return e}}class La extends Ut{constructor(e,t,n,i=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const Fi=new We,sl=new We,xr=[],rl=new Wn,Tf=new We,xs=new Ze,gs=new An;class Ef extends Ze{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new La(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,Tf)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Wn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Fi),rl.copy(e.boundingBox).applyMatrix4(Fi),this.boundingBox.union(rl)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new An),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Fi),gs.copy(e.boundingSphere).applyMatrix4(Fi),this.boundingSphere.union(gs)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const n=t.morphTargetInfluences,i=this.morphTexture.source.data.data,r=n.length+1,o=e*r+1;for(let a=0;a<n.length;a++)n[a]=i[o+a]}raycast(e,t){const n=this.matrixWorld,i=this.count;if(xs.geometry=this.geometry,xs.material=this.material,xs.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),gs.copy(this.boundingSphere),gs.applyMatrix4(n),e.ray.intersectsSphere(gs)!==!1))for(let r=0;r<i;r++){this.getMatrixAt(r,Fi),sl.multiplyMatrices(n,Fi),xs.matrixWorld=sl,xs.raycast(e,xr);for(let o=0,a=xr.length;o<a;o++){const c=xr[o];c.instanceId=r,c.object=this,t.push(c)}xr.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new La(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){const n=t.morphTargetInfluences,i=n.length+1;this.morphTexture===null&&(this.morphTexture=new ec(new Float32Array(i*this.count),i,this.count,Xa,mn));const r=this.morphTexture.source.data.data;let o=0;for(let l=0;l<n.length;l++)o+=n[l];const a=this.geometry.morphTargetsRelative?1:1-o,c=i*e;r[c]=a,r.set(n,c+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}}const Eo=new I,Af=new I,wf=new Xe;class di{constructor(e=new I(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,i){return this.normal.set(e,t,n),this.constant=i,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const i=Eo.subVectors(n,t).cross(Af.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(i,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta(Eo),i=this.normal.dot(n);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const r=-(e.start.dot(this.normal)+this.constant)/i;return r<0||r>1?null:t.copy(e.start).addScaledVector(n,r)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||wf.getNormalMatrix(e),i=this.coplanarPoint(Eo).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const ci=new An,Rf=new te(.5,.5),gr=new I;class nc{constructor(e=new di,t=new di,n=new di,i=new di,r=new di,o=new di){this.planes=[e,t,n,i,r,o]}set(e,t,n,i,r,o){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(i),a[4].copy(r),a[5].copy(o),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Sn,n=!1){const i=this.planes,r=e.elements,o=r[0],a=r[1],c=r[2],l=r[3],h=r[4],u=r[5],f=r[6],d=r[7],x=r[8],y=r[9],g=r[10],m=r[11],_=r[12],p=r[13],v=r[14],T=r[15];if(i[0].setComponents(l-o,d-h,m-x,T-_).normalize(),i[1].setComponents(l+o,d+h,m+x,T+_).normalize(),i[2].setComponents(l+a,d+u,m+y,T+p).normalize(),i[3].setComponents(l-a,d-u,m-y,T-p).normalize(),n)i[4].setComponents(c,f,g,v).normalize(),i[5].setComponents(l-c,d-f,m-g,T-v).normalize();else if(i[4].setComponents(l-c,d-f,m-g,T-v).normalize(),t===Sn)i[5].setComponents(l+c,d+f,m+g,T+v).normalize();else if(t===Br)i[5].setComponents(c,f,g,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),ci.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),ci.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(ci)}intersectsSprite(e){ci.center.set(0,0,0);const t=Rf.distanceTo(e.center);return ci.radius=.7071067811865476+t,ci.applyMatrix4(e.matrixWorld),this.intersectsSphere(ci)}intersectsSphere(e){const t=this.planes,n=e.center,i=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<i)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const i=t[n];if(gr.x=i.normal.x>0?e.max.x:e.min.x,gr.y=i.normal.y>0?e.max.y:e.min.y,gr.z=i.normal.z>0?e.max.z:e.min.z,i.distanceToPoint(gr)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class Fh extends xn{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ve(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const kr=new I,Vr=new I,ol=new We,_s=new qs,_r=new An,Ao=new I,al=new I;class ic extends gt{constructor(e=new _t,t=new Fh){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let i=1,r=t.count;i<r;i++)kr.fromBufferAttribute(t,i-1),Vr.fromBufferAttribute(t,i),n[i]=n[i-1],n[i]+=kr.distanceTo(Vr);e.setAttribute("lineDistance",new qe(n,1))}else Pe("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const n=this.geometry,i=this.matrixWorld,r=e.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),_r.copy(n.boundingSphere),_r.applyMatrix4(i),_r.radius+=r,e.ray.intersectsSphere(_r)===!1)return;ol.copy(i).invert(),_s.copy(e.ray).applyMatrix4(ol);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=a*a,l=this.isLineSegments?2:1,h=n.index,f=n.attributes.position;if(h!==null){const d=Math.max(0,o.start),x=Math.min(h.count,o.start+o.count);for(let y=d,g=x-1;y<g;y+=l){const m=h.getX(y),_=h.getX(y+1),p=vr(this,e,_s,c,m,_,y);p&&t.push(p)}if(this.isLineLoop){const y=h.getX(x-1),g=h.getX(d),m=vr(this,e,_s,c,y,g,x-1);m&&t.push(m)}}else{const d=Math.max(0,o.start),x=Math.min(f.count,o.start+o.count);for(let y=d,g=x-1;y<g;y+=l){const m=vr(this,e,_s,c,y,y+1,y);m&&t.push(m)}if(this.isLineLoop){const y=vr(this,e,_s,c,x-1,d,x-1);y&&t.push(y)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){const a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function vr(s,e,t,n,i,r,o){const a=s.geometry.attributes.position;if(kr.fromBufferAttribute(a,i),Vr.fromBufferAttribute(a,r),t.distanceSqToSegment(kr,Vr,Ao,al)>n)return;Ao.applyMatrix4(s.matrixWorld);const l=e.ray.origin.distanceTo(Ao);if(!(l<e.near||l>e.far))return{distance:l,point:al.clone().applyMatrix4(s.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:s}}const cl=new I,ll=new I;class Cf extends ic{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let i=0,r=t.count;i<r;i+=2)cl.fromBufferAttribute(t,i),ll.fromBufferAttribute(t,i+1),n[i]=i===0?0:n[i-1],n[i+1]=n[i]+cl.distanceTo(ll);e.setAttribute("lineDistance",new qe(n,1))}else Pe("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class Pf extends ic{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}}class Oh extends xn{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Ve(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const hl=new We,Ia=new qs,yr=new An,Mr=new I;class Lf extends gt{constructor(e=new _t,t=new Oh){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const n=this.geometry,i=this.matrixWorld,r=e.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),yr.copy(n.boundingSphere),yr.applyMatrix4(i),yr.radius+=r,e.ray.intersectsSphere(yr)===!1)return;hl.copy(i).invert(),Ia.copy(e.ray).applyMatrix4(hl);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=a*a,l=n.index,u=n.attributes.position;if(l!==null){const f=Math.max(0,o.start),d=Math.min(l.count,o.start+o.count);for(let x=f,y=d;x<y;x++){const g=l.getX(x);Mr.fromBufferAttribute(u,g),ul(Mr,g,c,i,e,t,this)}}else{const f=Math.max(0,o.start),d=Math.min(u.count,o.start+o.count);for(let x=f,y=d;x<y;x++)Mr.fromBufferAttribute(u,x),ul(Mr,x,c,i,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){const a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function ul(s,e,t,n,i,r,o){const a=Ia.distanceSqToPoint(s);if(a<t){const c=new I;Ia.closestPointToPoint(s,c),c.applyMatrix4(n);const l=i.ray.origin.distanceTo(c);if(l<i.near||l>i.far)return;r.push({distance:l,distanceToRay:Math.sqrt(a),point:c,index:e,face:null,faceIndex:null,barycoord:null,object:o})}}class sc extends Rt{constructor(e,t,n,i,r,o,a,c,l){super(e,t,n,i,r,o,a,c,l),this.isCanvasTexture=!0,this.needsUpdate=!0}}class Bh extends Rt{constructor(e,t,n=mi,i,r,o,a=Vt,c=Vt,l,h=Fs,u=1){if(h!==Fs&&h!==Os)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const f={width:e,height:t,depth:u};super(f,i,r,o,a,c,h,n,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Ja(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class zh extends Rt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class Qn extends _t{constructor(e=1,t=1,n=4,i=8,r=1){super(),this.type="CapsuleGeometry",this.parameters={radius:e,height:t,capSegments:n,radialSegments:i,heightSegments:r},t=Math.max(0,t),n=Math.max(1,Math.floor(n)),i=Math.max(3,Math.floor(i)),r=Math.max(1,Math.floor(r));const o=[],a=[],c=[],l=[],h=t/2,u=Math.PI/2*e,f=t,d=2*u+f,x=n*2+r,y=i+1,g=new I,m=new I;for(let _=0;_<=x;_++){let p=0,v=0,T=0,S=0;if(_<=n){const b=_/n,M=b*Math.PI/2;v=-h-e*Math.cos(M),T=e*Math.sin(M),S=-e*Math.cos(M),p=b*u}else if(_<=n+r){const b=(_-n)/r;v=-h+b*t,T=e,S=0,p=u+b*f}else{const b=(_-n-r)/n,M=b*Math.PI/2;v=h+e*Math.sin(M),T=e*Math.cos(M),S=e*Math.sin(M),p=u+f+b*u}const w=Math.max(0,Math.min(1,p/d));let L=0;_===0?L=.5/i:_===x&&(L=-.5/i);for(let b=0;b<=i;b++){const M=b/i,C=M*Math.PI*2,D=Math.sin(C),F=Math.cos(C);m.x=-T*F,m.y=v,m.z=T*D,a.push(m.x,m.y,m.z),g.set(-T*F,S,T*D),g.normalize(),c.push(g.x,g.y,g.z),l.push(M+L,w)}if(_>0){const b=(_-1)*y;for(let M=0;M<i;M++){const C=b+M,D=b+M+1,F=_*y+M,k=_*y+M+1;o.push(C,D,F),o.push(D,k,F)}}}this.setIndex(o),this.setAttribute("position",new qe(a,3)),this.setAttribute("normal",new qe(c,3)),this.setAttribute("uv",new qe(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Qn(e.radius,e.height,e.capSegments,e.radialSegments,e.heightSegments)}}class kh extends _t{constructor(e=1,t=32,n=0,i=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:i},t=Math.max(3,t);const r=[],o=[],a=[],c=[],l=new I,h=new te;o.push(0,0,0),a.push(0,0,1),c.push(.5,.5);for(let u=0,f=3;u<=t;u++,f+=3){const d=n+u/t*i;l.x=e*Math.cos(d),l.y=e*Math.sin(d),o.push(l.x,l.y,l.z),a.push(0,0,1),h.x=(o[f]/e+1)/2,h.y=(o[f+1]/e+1)/2,c.push(h.x,h.y)}for(let u=1;u<=t;u++)r.push(u,u+1,0);this.setIndex(r),this.setAttribute("position",new qe(o,3)),this.setAttribute("normal",new qe(a,3)),this.setAttribute("uv",new qe(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new kh(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class Nt extends _t{constructor(e=1,t=1,n=1,i=32,r=1,o=!1,a=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:i,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:c};const l=this;i=Math.floor(i),r=Math.floor(r);const h=[],u=[],f=[],d=[];let x=0;const y=[],g=n/2;let m=0;_(),o===!1&&(e>0&&p(!0),t>0&&p(!1)),this.setIndex(h),this.setAttribute("position",new qe(u,3)),this.setAttribute("normal",new qe(f,3)),this.setAttribute("uv",new qe(d,2));function _(){const v=new I,T=new I;let S=0;const w=(t-e)/n;for(let L=0;L<=r;L++){const b=[],M=L/r,C=M*(t-e)+e;for(let D=0;D<=i;D++){const F=D/i,k=F*c+a,z=Math.sin(k),V=Math.cos(k);T.x=C*z,T.y=-M*n+g,T.z=C*V,u.push(T.x,T.y,T.z),v.set(z,w,V).normalize(),f.push(v.x,v.y,v.z),d.push(F,1-M),b.push(x++)}y.push(b)}for(let L=0;L<i;L++)for(let b=0;b<r;b++){const M=y[b][L],C=y[b+1][L],D=y[b+1][L+1],F=y[b][L+1];(e>0||b!==0)&&(h.push(M,C,F),S+=3),(t>0||b!==r-1)&&(h.push(C,D,F),S+=3)}l.addGroup(m,S,0),m+=S}function p(v){const T=x,S=new te,w=new I;let L=0;const b=v===!0?e:t,M=v===!0?1:-1;for(let D=1;D<=i;D++)u.push(0,g*M,0),f.push(0,M,0),d.push(.5,.5),x++;const C=x;for(let D=0;D<=i;D++){const k=D/i*c+a,z=Math.cos(k),V=Math.sin(k);w.x=b*V,w.y=g*M,w.z=b*z,u.push(w.x,w.y,w.z),f.push(0,M,0),S.x=z*.5+.5,S.y=V*.5*M+.5,d.push(S.x,S.y),x++}for(let D=0;D<i;D++){const F=T+D,k=C+D;v===!0?h.push(k,k+1,F):h.push(k+1,k,F),L+=3}l.addGroup(m,L,v===!0?1:2),m+=L}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Nt(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class on extends Nt{constructor(e=1,t=1,n=32,i=1,r=!1,o=0,a=Math.PI*2){super(0,e,t,n,i,r,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:i,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(e){return new on(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Xr extends _t{constructor(e=[],t=[],n=1,i=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:i};const r=[],o=[];a(i),l(n),h(),this.setAttribute("position",new qe(r,3)),this.setAttribute("normal",new qe(r.slice(),3)),this.setAttribute("uv",new qe(o,2)),i===0?this.computeVertexNormals():this.normalizeNormals();function a(_){const p=new I,v=new I,T=new I;for(let S=0;S<t.length;S+=3)d(t[S+0],p),d(t[S+1],v),d(t[S+2],T),c(p,v,T,_)}function c(_,p,v,T){const S=T+1,w=[];for(let L=0;L<=S;L++){w[L]=[];const b=_.clone().lerp(v,L/S),M=p.clone().lerp(v,L/S),C=S-L;for(let D=0;D<=C;D++)D===0&&L===S?w[L][D]=b:w[L][D]=b.clone().lerp(M,D/C)}for(let L=0;L<S;L++)for(let b=0;b<2*(S-L)-1;b++){const M=Math.floor(b/2);b%2===0?(f(w[L][M+1]),f(w[L+1][M]),f(w[L][M])):(f(w[L][M+1]),f(w[L+1][M+1]),f(w[L+1][M]))}}function l(_){const p=new I;for(let v=0;v<r.length;v+=3)p.x=r[v+0],p.y=r[v+1],p.z=r[v+2],p.normalize().multiplyScalar(_),r[v+0]=p.x,r[v+1]=p.y,r[v+2]=p.z}function h(){const _=new I;for(let p=0;p<r.length;p+=3){_.x=r[p+0],_.y=r[p+1],_.z=r[p+2];const v=g(_)/2/Math.PI+.5,T=m(_)/Math.PI+.5;o.push(v,1-T)}x(),u()}function u(){for(let _=0;_<o.length;_+=6){const p=o[_+0],v=o[_+2],T=o[_+4],S=Math.max(p,v,T),w=Math.min(p,v,T);S>.9&&w<.1&&(p<.2&&(o[_+0]+=1),v<.2&&(o[_+2]+=1),T<.2&&(o[_+4]+=1))}}function f(_){r.push(_.x,_.y,_.z)}function d(_,p){const v=_*3;p.x=e[v+0],p.y=e[v+1],p.z=e[v+2]}function x(){const _=new I,p=new I,v=new I,T=new I,S=new te,w=new te,L=new te;for(let b=0,M=0;b<r.length;b+=9,M+=6){_.set(r[b+0],r[b+1],r[b+2]),p.set(r[b+3],r[b+4],r[b+5]),v.set(r[b+6],r[b+7],r[b+8]),S.set(o[M+0],o[M+1]),w.set(o[M+2],o[M+3]),L.set(o[M+4],o[M+5]),T.copy(_).add(p).add(v).divideScalar(3);const C=g(T);y(S,M+0,_,C),y(w,M+2,p,C),y(L,M+4,v,C)}}function y(_,p,v,T){T<0&&_.x===1&&(o[p]=_.x-1),v.x===0&&v.z===0&&(o[p]=T/2/Math.PI+.5)}function g(_){return Math.atan2(_.z,-_.x)}function m(_){return Math.atan2(-_.y,Math.sqrt(_.x*_.x+_.z*_.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Xr(e.vertices,e.indices,e.radius,e.details)}}class Vh extends Xr{constructor(e=1,t=0){const n=(1+Math.sqrt(5))/2,i=1/n,r=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-i,-n,0,-i,n,0,i,-n,0,i,n,-i,-n,0,-i,n,0,i,-n,0,i,n,0,-n,0,-i,n,0,-i,-n,0,i,n,0,i],o=[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9];super(r,o,e,t),this.type="DodecahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new Vh(e.radius,e.detail)}}class wn{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Pe("Curve: .getPoint() not implemented.")}getPointAt(e,t){const n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const t=[];let n,i=this.getPoint(0),r=0;t.push(0);for(let o=1;o<=e;o++)n=this.getPoint(o/e),r+=n.distanceTo(i),t.push(r),i=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){const n=this.getLengths();let i=0;const r=n.length;let o;t?o=t:o=e*n[r-1];let a=0,c=r-1,l;for(;a<=c;)if(i=Math.floor(a+(c-a)/2),l=n[i]-o,l<0)a=i+1;else if(l>0)c=i-1;else{c=i;break}if(i=c,n[i]===o)return i/(r-1);const h=n[i],f=n[i+1]-h,d=(o-h)/f;return(i+d)/(r-1)}getTangent(e,t){let i=e-1e-4,r=e+1e-4;i<0&&(i=0),r>1&&(r=1);const o=this.getPoint(i),a=this.getPoint(r),c=t||(o.isVector2?new te:new I);return c.copy(a).sub(o).normalize(),c}getTangentAt(e,t){const n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){const n=new I,i=[],r=[],o=[],a=new I,c=new We;for(let d=0;d<=e;d++){const x=d/e;i[d]=this.getTangentAt(x,new I)}r[0]=new I,o[0]=new I;let l=Number.MAX_VALUE;const h=Math.abs(i[0].x),u=Math.abs(i[0].y),f=Math.abs(i[0].z);h<=l&&(l=h,n.set(1,0,0)),u<=l&&(l=u,n.set(0,1,0)),f<=l&&n.set(0,0,1),a.crossVectors(i[0],n).normalize(),r[0].crossVectors(i[0],a),o[0].crossVectors(i[0],r[0]);for(let d=1;d<=e;d++){if(r[d]=r[d-1].clone(),o[d]=o[d-1].clone(),a.crossVectors(i[d-1],i[d]),a.length()>Number.EPSILON){a.normalize();const x=Math.acos(Ke(i[d-1].dot(i[d]),-1,1));r[d].applyMatrix4(c.makeRotationAxis(a,x))}o[d].crossVectors(i[d],r[d])}if(t===!0){let d=Math.acos(Ke(r[0].dot(r[e]),-1,1));d/=e,i[0].dot(a.crossVectors(r[0],r[e]))>0&&(d=-d);for(let x=1;x<=e;x++)r[x].applyMatrix4(c.makeRotationAxis(i[x],d*x)),o[x].crossVectors(i[x],r[x])}return{tangents:i,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){const e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}}class rc extends wn{constructor(e=0,t=0,n=1,i=1,r=0,o=Math.PI*2,a=!1,c=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=i,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=c}getPoint(e,t=new te){const n=t,i=Math.PI*2;let r=this.aEndAngle-this.aStartAngle;const o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=i;for(;r>i;)r-=i;r<Number.EPSILON&&(o?r=0:r=i),this.aClockwise===!0&&!o&&(r===i?r=-i:r=r-i);const a=this.aStartAngle+e*r;let c=this.aX+this.xRadius*Math.cos(a),l=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){const h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),f=c-this.aX,d=l-this.aY;c=f*h-d*u+this.aX,l=f*u+d*h+this.aY}return n.set(c,l)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){const e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}class If extends rc{constructor(e,t,n,i,r,o){super(e,t,n,n,i,r,o),this.isArcCurve=!0,this.type="ArcCurve"}}function oc(){let s=0,e=0,t=0,n=0;function i(r,o,a,c){s=r,e=a,t=-3*r+3*o-2*a-c,n=2*r-2*o+a+c}return{initCatmullRom:function(r,o,a,c,l){i(o,a,l*(a-r),l*(c-o))},initNonuniformCatmullRom:function(r,o,a,c,l,h,u){let f=(o-r)/l-(a-r)/(l+h)+(a-o)/h,d=(a-o)/h-(c-o)/(h+u)+(c-a)/u;f*=h,d*=h,i(o,a,f,d)},calc:function(r){const o=r*r,a=o*r;return s+e*r+t*o+n*a}}}const br=new I,wo=new oc,Ro=new oc,Co=new oc;class Df extends wn{constructor(e=[],t=!1,n="centripetal",i=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=i}getPoint(e,t=new I){const n=t,i=this.points,r=i.length,o=(r-(this.closed?0:1))*e;let a=Math.floor(o),c=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:c===0&&a===r-1&&(a=r-2,c=1);let l,h;this.closed||a>0?l=i[(a-1)%r]:(br.subVectors(i[0],i[1]).add(i[0]),l=br);const u=i[a%r],f=i[(a+1)%r];if(this.closed||a+2<r?h=i[(a+2)%r]:(br.subVectors(i[r-1],i[r-2]).add(i[r-1]),h=br),this.curveType==="centripetal"||this.curveType==="chordal"){const d=this.curveType==="chordal"?.5:.25;let x=Math.pow(l.distanceToSquared(u),d),y=Math.pow(u.distanceToSquared(f),d),g=Math.pow(f.distanceToSquared(h),d);y<1e-4&&(y=1),x<1e-4&&(x=y),g<1e-4&&(g=y),wo.initNonuniformCatmullRom(l.x,u.x,f.x,h.x,x,y,g),Ro.initNonuniformCatmullRom(l.y,u.y,f.y,h.y,x,y,g),Co.initNonuniformCatmullRom(l.z,u.z,f.z,h.z,x,y,g)}else this.curveType==="catmullrom"&&(wo.initCatmullRom(l.x,u.x,f.x,h.x,this.tension),Ro.initCatmullRom(l.y,u.y,f.y,h.y,this.tension),Co.initCatmullRom(l.z,u.z,f.z,h.z,this.tension));return n.set(wo.calc(c),Ro.calc(c),Co.calc(c)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const i=e.points[t];this.points.push(i.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const i=this.points[t];e.points.push(i.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const i=e.points[t];this.points.push(new I().fromArray(i))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}}function dl(s,e,t,n,i){const r=(n-e)*.5,o=(i-t)*.5,a=s*s,c=s*a;return(2*t-2*n+r+o)*c+(-3*t+3*n-2*r-o)*a+r*s+t}function Nf(s,e){const t=1-s;return t*t*e}function Uf(s,e){return 2*(1-s)*s*e}function Ff(s,e){return s*s*e}function Rs(s,e,t,n){return Nf(s,e)+Uf(s,t)+Ff(s,n)}function Of(s,e){const t=1-s;return t*t*t*e}function Bf(s,e){const t=1-s;return 3*t*t*s*e}function zf(s,e){return 3*(1-s)*s*s*e}function kf(s,e){return s*s*s*e}function Cs(s,e,t,n,i){return Of(s,e)+Bf(s,t)+zf(s,n)+kf(s,i)}class Gh extends wn{constructor(e=new te,t=new te,n=new te,i=new te){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=i}getPoint(e,t=new te){const n=t,i=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(Cs(e,i.x,r.x,o.x,a.x),Cs(e,i.y,r.y,o.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class Vf extends wn{constructor(e=new I,t=new I,n=new I,i=new I){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=i}getPoint(e,t=new I){const n=t,i=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(Cs(e,i.x,r.x,o.x,a.x),Cs(e,i.y,r.y,o.y,a.y),Cs(e,i.z,r.z,o.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class Hh extends wn{constructor(e=new te,t=new te){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new te){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new te){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Gf extends wn{constructor(e=new I,t=new I){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new I){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new I){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Wh extends wn{constructor(e=new te,t=new te,n=new te){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new te){const n=t,i=this.v0,r=this.v1,o=this.v2;return n.set(Rs(e,i.x,r.x,o.x),Rs(e,i.y,r.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Xh extends wn{constructor(e=new I,t=new I,n=new I){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new I){const n=t,i=this.v0,r=this.v1,o=this.v2;return n.set(Rs(e,i.x,r.x,o.x),Rs(e,i.y,r.y,o.y),Rs(e,i.z,r.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class qh extends wn{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new te){const n=t,i=this.points,r=(i.length-1)*e,o=Math.floor(r),a=r-o,c=i[o===0?o:o-1],l=i[o],h=i[o>i.length-2?i.length-1:o+1],u=i[o>i.length-3?i.length-1:o+2];return n.set(dl(a,c.x,l.x,h.x,u.x),dl(a,c.y,l.y,h.y,u.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const i=e.points[t];this.points.push(i.clone())}return this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const i=this.points[t];e.points.push(i.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const i=e.points[t];this.points.push(new te().fromArray(i))}return this}}var Gr=Object.freeze({__proto__:null,ArcCurve:If,CatmullRomCurve3:Df,CubicBezierCurve:Gh,CubicBezierCurve3:Vf,EllipseCurve:rc,LineCurve:Hh,LineCurve3:Gf,QuadraticBezierCurve:Wh,QuadraticBezierCurve3:Xh,SplineCurve:qh});class Hf extends wn{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){const e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){const n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Gr[n](t,e))}return this}getPoint(e,t){const n=e*this.getLength(),i=this.getCurveLengths();let r=0;for(;r<i.length;){if(i[r]>=n){const o=i[r]-n,a=this.curves[r],c=a.getLength(),l=c===0?0:1-o/c;return a.getPointAt(l,t)}r++}return null}getLength(){const e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const e=[];let t=0;for(let n=0,i=this.curves.length;n<i;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){const t=[];let n;for(let i=0,r=this.curves;i<r.length;i++){const o=r[i],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,c=o.getPoints(a);for(let l=0;l<c.length;l++){const h=c[l];n&&n.equals(h)||(t.push(h),n=h)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){const i=e.curves[t];this.curves.push(i.clone())}return this.autoClose=e.autoClose,this}toJSON(){const e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){const i=this.curves[t];e.curves.push(i.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){const i=e.curves[t];this.curves.push(new Gr[i.type]().fromJSON(i))}return this}}class fl extends Hf{constructor(e){super(),this.type="Path",this.currentPoint=new te,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){const n=new Hh(this.currentPoint.clone(),new te(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,i){const r=new Wh(this.currentPoint.clone(),new te(e,t),new te(n,i));return this.curves.push(r),this.currentPoint.set(n,i),this}bezierCurveTo(e,t,n,i,r,o){const a=new Gh(this.currentPoint.clone(),new te(e,t),new te(n,i),new te(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(e){const t=[this.currentPoint.clone()].concat(e),n=new qh(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,i,r,o){const a=this.currentPoint.x,c=this.currentPoint.y;return this.absarc(e+a,t+c,n,i,r,o),this}absarc(e,t,n,i,r,o){return this.absellipse(e,t,n,n,i,r,o),this}ellipse(e,t,n,i,r,o,a,c){const l=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(e+l,t+h,n,i,r,o,a,c),this}absellipse(e,t,n,i,r,o,a,c){const l=new rc(e,t,n,i,r,o,a,c);if(this.curves.length>0){const u=l.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(l);const h=l.getPoint(1);return this.currentPoint.copy(h),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){const e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}}class Yh extends fl{constructor(e){super(e),this.uuid=cn(),this.type="Shape",this.holes=[]}getPointsHoles(e){const t=[];for(let n=0,i=this.holes.length;n<i;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){const i=e.holes[t];this.holes.push(i.clone())}return this}toJSON(){const e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){const i=this.holes[t];e.holes.push(i.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){const i=e.holes[t];this.holes.push(new fl().fromJSON(i))}return this}}function Wf(s,e,t=2){const n=e&&e.length,i=n?e[0]*t:s.length;let r=$h(s,0,i,t,!0);const o=[];if(!r||r.next===r.prev)return o;let a,c,l;if(n&&(r=Kf(s,e,r,t)),s.length>80*t){a=s[0],c=s[1];let h=a,u=c;for(let f=t;f<i;f+=t){const d=s[f],x=s[f+1];d<a&&(a=d),x<c&&(c=x),d>h&&(h=d),x>u&&(u=x)}l=Math.max(h-a,u-c),l=l!==0?32767/l:0}return Hs(r,o,t,a,c,l,0),o}function $h(s,e,t,n,i){let r;if(i===op(s,e,t,n)>0)for(let o=e;o<t;o+=n)r=pl(o/n|0,s[o],s[o+1],r);else for(let o=t-n;o>=e;o-=n)r=pl(o/n|0,s[o],s[o+1],r);return r&&ji(r,r.next)&&(Xs(r),r=r.next),r}function gi(s,e){if(!s)return s;e||(e=s);let t=s,n;do if(n=!1,!t.steiner&&(ji(t,t.next)||Mt(t.prev,t,t.next)===0)){if(Xs(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function Hs(s,e,t,n,i,r,o){if(!s)return;!o&&r&&ep(s,n,i,r);let a=s;for(;s.prev!==s.next;){const c=s.prev,l=s.next;if(r?qf(s,n,i,r):Xf(s)){e.push(c.i,s.i,l.i),Xs(s),s=l.next,a=l.next;continue}if(s=l,s===a){o?o===1?(s=Yf(gi(s),e),Hs(s,e,t,n,i,r,2)):o===2&&$f(s,e,t,n,i,r):Hs(gi(s),e,t,n,i,r,1);break}}}function Xf(s){const e=s.prev,t=s,n=s.next;if(Mt(e,t,n)>=0)return!1;const i=e.x,r=t.x,o=n.x,a=e.y,c=t.y,l=n.y,h=Math.min(i,r,o),u=Math.min(a,c,l),f=Math.max(i,r,o),d=Math.max(a,c,l);let x=n.next;for(;x!==e;){if(x.x>=h&&x.x<=f&&x.y>=u&&x.y<=d&&Ts(i,a,r,c,o,l,x.x,x.y)&&Mt(x.prev,x,x.next)>=0)return!1;x=x.next}return!0}function qf(s,e,t,n){const i=s.prev,r=s,o=s.next;if(Mt(i,r,o)>=0)return!1;const a=i.x,c=r.x,l=o.x,h=i.y,u=r.y,f=o.y,d=Math.min(a,c,l),x=Math.min(h,u,f),y=Math.max(a,c,l),g=Math.max(h,u,f),m=Da(d,x,e,t,n),_=Da(y,g,e,t,n);let p=s.prevZ,v=s.nextZ;for(;p&&p.z>=m&&v&&v.z<=_;){if(p.x>=d&&p.x<=y&&p.y>=x&&p.y<=g&&p!==i&&p!==o&&Ts(a,h,c,u,l,f,p.x,p.y)&&Mt(p.prev,p,p.next)>=0||(p=p.prevZ,v.x>=d&&v.x<=y&&v.y>=x&&v.y<=g&&v!==i&&v!==o&&Ts(a,h,c,u,l,f,v.x,v.y)&&Mt(v.prev,v,v.next)>=0))return!1;v=v.nextZ}for(;p&&p.z>=m;){if(p.x>=d&&p.x<=y&&p.y>=x&&p.y<=g&&p!==i&&p!==o&&Ts(a,h,c,u,l,f,p.x,p.y)&&Mt(p.prev,p,p.next)>=0)return!1;p=p.prevZ}for(;v&&v.z<=_;){if(v.x>=d&&v.x<=y&&v.y>=x&&v.y<=g&&v!==i&&v!==o&&Ts(a,h,c,u,l,f,v.x,v.y)&&Mt(v.prev,v,v.next)>=0)return!1;v=v.nextZ}return!0}function Yf(s,e){let t=s;do{const n=t.prev,i=t.next.next;!ji(n,i)&&jh(n,t,t.next,i)&&Ws(n,i)&&Ws(i,n)&&(e.push(n.i,t.i,i.i),Xs(t),Xs(t.next),t=s=i),t=t.next}while(t!==s);return gi(t)}function $f(s,e,t,n,i,r){let o=s;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&ip(o,a)){let c=Jh(o,a);o=gi(o,o.next),c=gi(c,c.next),Hs(o,e,t,n,i,r,0),Hs(c,e,t,n,i,r,0);return}a=a.next}o=o.next}while(o!==s)}function Kf(s,e,t,n){const i=[];for(let r=0,o=e.length;r<o;r++){const a=e[r]*n,c=r<o-1?e[r+1]*n:s.length,l=$h(s,a,c,n,!1);l===l.next&&(l.steiner=!0),i.push(np(l))}i.sort(jf);for(let r=0;r<i.length;r++)t=Jf(i[r],t);return t}function jf(s,e){let t=s.x-e.x;if(t===0&&(t=s.y-e.y,t===0)){const n=(s.next.y-s.y)/(s.next.x-s.x),i=(e.next.y-e.y)/(e.next.x-e.x);t=n-i}return t}function Jf(s,e){const t=Zf(s,e);if(!t)return e;const n=Jh(t,s);return gi(n,n.next),gi(t,t.next)}function Zf(s,e){let t=e;const n=s.x,i=s.y;let r=-1/0,o;if(ji(s,t))return t;do{if(ji(s,t.next))return t.next;if(i<=t.y&&i>=t.next.y&&t.next.y!==t.y){const u=t.x+(i-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(u<=n&&u>r&&(r=u,o=t.x<t.next.x?t:t.next,u===n))return o}t=t.next}while(t!==e);if(!o)return null;const a=o,c=o.x,l=o.y;let h=1/0;t=o;do{if(n>=t.x&&t.x>=c&&n!==t.x&&Kh(i<l?n:r,i,c,l,i<l?r:n,i,t.x,t.y)){const u=Math.abs(i-t.y)/(n-t.x);Ws(t,s)&&(u<h||u===h&&(t.x>o.x||t.x===o.x&&Qf(o,t)))&&(o=t,h=u)}t=t.next}while(t!==a);return o}function Qf(s,e){return Mt(s.prev,s,e.prev)<0&&Mt(e.next,s,s.next)<0}function ep(s,e,t,n){let i=s;do i.z===0&&(i.z=Da(i.x,i.y,e,t,n)),i.prevZ=i.prev,i.nextZ=i.next,i=i.next;while(i!==s);i.prevZ.nextZ=null,i.prevZ=null,tp(i)}function tp(s){let e,t=1;do{let n=s,i;s=null;let r=null;for(e=0;n;){e++;let o=n,a=0;for(let l=0;l<t&&(a++,o=o.nextZ,!!o);l++);let c=t;for(;a>0||c>0&&o;)a!==0&&(c===0||!o||n.z<=o.z)?(i=n,n=n.nextZ,a--):(i=o,o=o.nextZ,c--),r?r.nextZ=i:s=i,i.prevZ=r,r=i;n=o}r.nextZ=null,t*=2}while(e>1);return s}function Da(s,e,t,n,i){return s=(s-t)*i|0,e=(e-n)*i|0,s=(s|s<<8)&16711935,s=(s|s<<4)&252645135,s=(s|s<<2)&858993459,s=(s|s<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,s|e<<1}function np(s){let e=s,t=s;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==s);return t}function Kh(s,e,t,n,i,r,o,a){return(i-o)*(e-a)>=(s-o)*(r-a)&&(s-o)*(n-a)>=(t-o)*(e-a)&&(t-o)*(r-a)>=(i-o)*(n-a)}function Ts(s,e,t,n,i,r,o,a){return!(s===o&&e===a)&&Kh(s,e,t,n,i,r,o,a)}function ip(s,e){return s.next.i!==e.i&&s.prev.i!==e.i&&!sp(s,e)&&(Ws(s,e)&&Ws(e,s)&&rp(s,e)&&(Mt(s.prev,s,e.prev)||Mt(s,e.prev,e))||ji(s,e)&&Mt(s.prev,s,s.next)>0&&Mt(e.prev,e,e.next)>0)}function Mt(s,e,t){return(e.y-s.y)*(t.x-e.x)-(e.x-s.x)*(t.y-e.y)}function ji(s,e){return s.x===e.x&&s.y===e.y}function jh(s,e,t,n){const i=Tr(Mt(s,e,t)),r=Tr(Mt(s,e,n)),o=Tr(Mt(t,n,s)),a=Tr(Mt(t,n,e));return!!(i!==r&&o!==a||i===0&&Sr(s,t,e)||r===0&&Sr(s,n,e)||o===0&&Sr(t,s,n)||a===0&&Sr(t,e,n))}function Sr(s,e,t){return e.x<=Math.max(s.x,t.x)&&e.x>=Math.min(s.x,t.x)&&e.y<=Math.max(s.y,t.y)&&e.y>=Math.min(s.y,t.y)}function Tr(s){return s>0?1:s<0?-1:0}function sp(s,e){let t=s;do{if(t.i!==s.i&&t.next.i!==s.i&&t.i!==e.i&&t.next.i!==e.i&&jh(t,t.next,s,e))return!0;t=t.next}while(t!==s);return!1}function Ws(s,e){return Mt(s.prev,s,s.next)<0?Mt(s,e,s.next)>=0&&Mt(s,s.prev,e)>=0:Mt(s,e,s.prev)<0||Mt(s,s.next,e)<0}function rp(s,e){let t=s,n=!1;const i=(s.x+e.x)/2,r=(s.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&i<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==s);return n}function Jh(s,e){const t=Na(s.i,s.x,s.y),n=Na(e.i,e.x,e.y),i=s.next,r=e.prev;return s.next=e,e.prev=s,t.next=i,i.prev=t,n.next=t,t.prev=n,r.next=n,n.prev=r,n}function pl(s,e,t,n){const i=Na(s,e,t);return n?(i.next=n.next,i.prev=n,n.next.prev=i,n.next=i):(i.prev=i,i.next=i),i}function Xs(s){s.next.prev=s.prev,s.prev.next=s.next,s.prevZ&&(s.prevZ.nextZ=s.nextZ),s.nextZ&&(s.nextZ.prevZ=s.prevZ)}function Na(s,e,t){return{i:s,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function op(s,e,t,n){let i=0;for(let r=e,o=t-n;r<t;r+=n)i+=(s[o]-s[r])*(s[r+1]+s[o+1]),o=r;return i}class ap{static triangulate(e,t,n=2){return Wf(e,t,n)}}class Bn{static area(e){const t=e.length;let n=0;for(let i=t-1,r=0;r<t;i=r++)n+=e[i].x*e[r].y-e[r].x*e[i].y;return n*.5}static isClockWise(e){return Bn.area(e)<0}static triangulateShape(e,t){const n=[],i=[],r=[];ml(e),xl(n,e);let o=e.length;t.forEach(ml);for(let c=0;c<t.length;c++)i.push(o),o+=t[c].length,xl(n,t[c]);const a=ap.triangulate(n,i);for(let c=0;c<a.length;c+=3)r.push(a.slice(c,c+3));return r}}function ml(s){const e=s.length;e>2&&s[e-1].equals(s[0])&&s.pop()}function xl(s,e){for(let t=0;t<e.length;t++)s.push(e[t].x),s.push(e[t].y)}class Zh extends _t{constructor(e=new Yh([new te(.5,.5),new te(-.5,.5),new te(-.5,-.5),new te(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];const n=this,i=[],r=[];for(let a=0,c=e.length;a<c;a++){const l=e[a];o(l)}this.setAttribute("position",new qe(i,3)),this.setAttribute("uv",new qe(r,2)),this.computeVertexNormals();function o(a){const c=[],l=t.curveSegments!==void 0?t.curveSegments:12,h=t.steps!==void 0?t.steps:1,u=t.depth!==void 0?t.depth:1;let f=t.bevelEnabled!==void 0?t.bevelEnabled:!0,d=t.bevelThickness!==void 0?t.bevelThickness:.2,x=t.bevelSize!==void 0?t.bevelSize:d-.1,y=t.bevelOffset!==void 0?t.bevelOffset:0,g=t.bevelSegments!==void 0?t.bevelSegments:3;const m=t.extrudePath,_=t.UVGenerator!==void 0?t.UVGenerator:cp;let p,v=!1,T,S,w,L;m&&(p=m.getSpacedPoints(h),v=!0,f=!1,T=m.computeFrenetFrames(h,!1),S=new I,w=new I,L=new I),f||(g=0,d=0,x=0,y=0);const b=a.extractPoints(l);let M=b.shape;const C=b.holes;if(!Bn.isClockWise(M)){M=M.reverse();for(let Q=0,P=C.length;Q<P;Q++){const Z=C[Q];Bn.isClockWise(Z)&&(C[Q]=Z.reverse())}}function F(Q){const Z=10000000000000001e-36;let re=Q[0];for(let ce=1;ce<=Q.length;ce++){const ie=ce%Q.length,be=Q[ie],de=be.x-re.x,ve=be.y-re.y,R=de*de+ve*ve,E=Math.max(Math.abs(be.x),Math.abs(be.y),Math.abs(re.x),Math.abs(re.y)),B=Z*E*E;if(R<=B){Q.splice(ie,1),ce--;continue}re=be}}F(M),C.forEach(F);const k=C.length,z=M;for(let Q=0;Q<k;Q++){const P=C[Q];M=M.concat(P)}function V(Q,P,Z){return P||$e("ExtrudeGeometry: vec does not exist"),Q.clone().addScaledVector(P,Z)}const Y=M.length;function G(Q,P,Z){let re,ce,ie;const be=Q.x-P.x,de=Q.y-P.y,ve=Z.x-Q.x,R=Z.y-Q.y,E=be*be+de*de,B=be*R-de*ve;if(Math.abs(B)>Number.EPSILON){const q=Math.sqrt(E),j=Math.sqrt(ve*ve+R*R),X=P.x-de/q,Ce=P.y+be/q,fe=Z.x-R/j,Le=Z.y+ve/j,we=((fe-X)*R-(Le-Ce)*ve)/(be*R-de*ve);re=X+be*we-Q.x,ce=Ce+de*we-Q.y;const ee=re*re+ce*ce;if(ee<=2)return new te(re,ce);ie=Math.sqrt(ee/2)}else{let q=!1;be>Number.EPSILON?ve>Number.EPSILON&&(q=!0):be<-Number.EPSILON?ve<-Number.EPSILON&&(q=!0):Math.sign(de)===Math.sign(R)&&(q=!0),q?(re=-de,ce=be,ie=Math.sqrt(E)):(re=be,ce=de,ie=Math.sqrt(E/2))}return new te(re/ie,ce/ie)}const ne=[];for(let Q=0,P=z.length,Z=P-1,re=Q+1;Q<P;Q++,Z++,re++)Z===P&&(Z=0),re===P&&(re=0),ne[Q]=G(z[Q],z[Z],z[re]);const oe=[];let Ae,je=ne.concat();for(let Q=0,P=k;Q<P;Q++){const Z=C[Q];Ae=[];for(let re=0,ce=Z.length,ie=ce-1,be=re+1;re<ce;re++,ie++,be++)ie===ce&&(ie=0),be===ce&&(be=0),Ae[re]=G(Z[re],Z[ie],Z[be]);oe.push(Ae),je=je.concat(Ae)}let et;if(g===0)et=Bn.triangulateShape(z,C);else{const Q=[],P=[];for(let Z=0;Z<g;Z++){const re=Z/g,ce=d*Math.cos(re*Math.PI/2),ie=x*Math.sin(re*Math.PI/2)+y;for(let be=0,de=z.length;be<de;be++){const ve=V(z[be],ne[be],ie);De(ve.x,ve.y,-ce),re===0&&Q.push(ve)}for(let be=0,de=k;be<de;be++){const ve=C[be];Ae=oe[be];const R=[];for(let E=0,B=ve.length;E<B;E++){const q=V(ve[E],Ae[E],ie);De(q.x,q.y,-ce),re===0&&R.push(q)}re===0&&P.push(R)}}et=Bn.triangulateShape(Q,P)}const rt=et.length,at=x+y;for(let Q=0;Q<Y;Q++){const P=f?V(M[Q],je[Q],at):M[Q];v?(w.copy(T.normals[0]).multiplyScalar(P.x),S.copy(T.binormals[0]).multiplyScalar(P.y),L.copy(p[0]).add(w).add(S),De(L.x,L.y,L.z)):De(P.x,P.y,0)}for(let Q=1;Q<=h;Q++)for(let P=0;P<Y;P++){const Z=f?V(M[P],je[P],at):M[P];v?(w.copy(T.normals[Q]).multiplyScalar(Z.x),S.copy(T.binormals[Q]).multiplyScalar(Z.y),L.copy(p[Q]).add(w).add(S),De(L.x,L.y,L.z)):De(Z.x,Z.y,u/h*Q)}for(let Q=g-1;Q>=0;Q--){const P=Q/g,Z=d*Math.cos(P*Math.PI/2),re=x*Math.sin(P*Math.PI/2)+y;for(let ce=0,ie=z.length;ce<ie;ce++){const be=V(z[ce],ne[ce],re);De(be.x,be.y,u+Z)}for(let ce=0,ie=C.length;ce<ie;ce++){const be=C[ce];Ae=oe[ce];for(let de=0,ve=be.length;de<ve;de++){const R=V(be[de],Ae[de],re);v?De(R.x,R.y+p[h-1].y,p[h-1].x+Z):De(R.x,R.y,u+Z)}}}$(),J();function $(){const Q=i.length/3;if(f){let P=0,Z=Y*P;for(let re=0;re<rt;re++){const ce=et[re];Re(ce[2]+Z,ce[1]+Z,ce[0]+Z)}P=h+g*2,Z=Y*P;for(let re=0;re<rt;re++){const ce=et[re];Re(ce[0]+Z,ce[1]+Z,ce[2]+Z)}}else{for(let P=0;P<rt;P++){const Z=et[P];Re(Z[2],Z[1],Z[0])}for(let P=0;P<rt;P++){const Z=et[P];Re(Z[0]+Y*h,Z[1]+Y*h,Z[2]+Y*h)}}n.addGroup(Q,i.length/3-Q,0)}function J(){const Q=i.length/3;let P=0;ye(z,P),P+=z.length;for(let Z=0,re=C.length;Z<re;Z++){const ce=C[Z];ye(ce,P),P+=ce.length}n.addGroup(Q,i.length/3-Q,1)}function ye(Q,P){let Z=Q.length;for(;--Z>=0;){const re=Z;let ce=Z-1;ce<0&&(ce=Q.length-1);for(let ie=0,be=h+g*2;ie<be;ie++){const de=Y*ie,ve=Y*(ie+1),R=P+re+de,E=P+ce+de,B=P+ce+ve,q=P+re+ve;Je(R,E,B,q)}}}function De(Q,P,Z){c.push(Q),c.push(P),c.push(Z)}function Re(Q,P,Z){pt(Q),pt(P),pt(Z);const re=i.length/3,ce=_.generateTopUV(n,i,re-3,re-2,re-1);Be(ce[0]),Be(ce[1]),Be(ce[2])}function Je(Q,P,Z,re){pt(Q),pt(P),pt(re),pt(P),pt(Z),pt(re);const ce=i.length/3,ie=_.generateSideWallUV(n,i,ce-6,ce-3,ce-2,ce-1);Be(ie[0]),Be(ie[1]),Be(ie[3]),Be(ie[1]),Be(ie[2]),Be(ie[3])}function pt(Q){i.push(c[Q*3+0]),i.push(c[Q*3+1]),i.push(c[Q*3+2])}function Be(Q){r.push(Q.x),r.push(Q.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON(),t=this.parameters.shapes,n=this.parameters.options;return lp(t,n,e)}static fromJSON(e,t){const n=[];for(let r=0,o=e.shapes.length;r<o;r++){const a=t[e.shapes[r]];n.push(a)}const i=e.options.extrudePath;return i!==void 0&&(e.options.extrudePath=new Gr[i.type]().fromJSON(i)),new Zh(n,e.options)}}const cp={generateTopUV:function(s,e,t,n,i){const r=e[t*3],o=e[t*3+1],a=e[n*3],c=e[n*3+1],l=e[i*3],h=e[i*3+1];return[new te(r,o),new te(a,c),new te(l,h)]},generateSideWallUV:function(s,e,t,n,i,r){const o=e[t*3],a=e[t*3+1],c=e[t*3+2],l=e[n*3],h=e[n*3+1],u=e[n*3+2],f=e[i*3],d=e[i*3+1],x=e[i*3+2],y=e[r*3],g=e[r*3+1],m=e[r*3+2];return Math.abs(a-h)<Math.abs(o-l)?[new te(o,1-c),new te(l,1-u),new te(f,1-x),new te(y,1-m)]:[new te(a,1-c),new te(h,1-u),new te(d,1-x),new te(g,1-m)]}};function lp(s,e,t){if(t.shapes=[],Array.isArray(s))for(let n=0,i=s.length;n<i;n++){const r=s[n];t.shapes.push(r.uuid)}else t.shapes.push(s.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}class Qh extends _t{constructor(e=[new te(0,-.5),new te(.5,0),new te(0,.5)],t=12,n=0,i=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:n,phiLength:i},t=Math.floor(t),i=Ke(i,0,Math.PI*2);const r=[],o=[],a=[],c=[],l=[],h=1/t,u=new I,f=new te,d=new I,x=new I,y=new I;let g=0,m=0;for(let _=0;_<=e.length-1;_++)switch(_){case 0:g=e[_+1].x-e[_].x,m=e[_+1].y-e[_].y,d.x=m*1,d.y=-g,d.z=m*0,y.copy(d),d.normalize(),c.push(d.x,d.y,d.z);break;case e.length-1:c.push(y.x,y.y,y.z);break;default:g=e[_+1].x-e[_].x,m=e[_+1].y-e[_].y,d.x=m*1,d.y=-g,d.z=m*0,x.copy(d),d.x+=y.x,d.y+=y.y,d.z+=y.z,d.normalize(),c.push(d.x,d.y,d.z),y.copy(x)}for(let _=0;_<=t;_++){const p=n+_*h*i,v=Math.sin(p),T=Math.cos(p);for(let S=0;S<=e.length-1;S++){u.x=e[S].x*v,u.y=e[S].y,u.z=e[S].x*T,o.push(u.x,u.y,u.z),f.x=_/t,f.y=S/(e.length-1),a.push(f.x,f.y);const w=c[3*S+0]*v,L=c[3*S+1],b=c[3*S+0]*T;l.push(w,L,b)}}for(let _=0;_<t;_++)for(let p=0;p<e.length-1;p++){const v=p+_*e.length,T=v,S=v+e.length,w=v+e.length+1,L=v+1;r.push(T,S,L),r.push(w,L,S)}this.setIndex(r),this.setAttribute("position",new qe(o,3)),this.setAttribute("uv",new qe(a,2)),this.setAttribute("normal",new qe(l,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Qh(e.points,e.segments,e.phiStart,e.phiLength)}}class qr extends Xr{constructor(e=1,t=0){const n=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],i=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(n,i,e,t),this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new qr(e.radius,e.detail)}}class Yr extends _t{constructor(e=1,t=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:i};const r=e/2,o=t/2,a=Math.floor(n),c=Math.floor(i),l=a+1,h=c+1,u=e/a,f=t/c,d=[],x=[],y=[],g=[];for(let m=0;m<h;m++){const _=m*f-o;for(let p=0;p<l;p++){const v=p*u-r;x.push(v,-_,0),y.push(0,0,1),g.push(p/a),g.push(1-m/c)}}for(let m=0;m<c;m++)for(let _=0;_<a;_++){const p=_+l*m,v=_+l*(m+1),T=_+1+l*(m+1),S=_+1+l*m;d.push(p,v,S),d.push(v,T,S)}this.setIndex(d),this.setAttribute("position",new qe(x,3)),this.setAttribute("normal",new qe(y,3)),this.setAttribute("uv",new qe(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Yr(e.width,e.height,e.widthSegments,e.heightSegments)}}class Mn extends _t{constructor(e=.5,t=1,n=32,i=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:i,thetaStart:r,thetaLength:o},n=Math.max(3,n),i=Math.max(1,i);const a=[],c=[],l=[],h=[];let u=e;const f=(t-e)/i,d=new I,x=new te;for(let y=0;y<=i;y++){for(let g=0;g<=n;g++){const m=r+g/n*o;d.x=u*Math.cos(m),d.y=u*Math.sin(m),c.push(d.x,d.y,d.z),l.push(0,0,1),x.x=(d.x/t+1)/2,x.y=(d.y/t+1)/2,h.push(x.x,x.y)}u+=f}for(let y=0;y<i;y++){const g=y*(n+1);for(let m=0;m<n;m++){const _=m+g,p=_,v=_+n+1,T=_+n+2,S=_+1;a.push(p,v,S),a.push(v,T,S)}}this.setIndex(a),this.setAttribute("position",new qe(c,3)),this.setAttribute("normal",new qe(l,3)),this.setAttribute("uv",new qe(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Mn(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class eu extends _t{constructor(e=new Yh([new te(0,.5),new te(-.5,-.5),new te(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};const n=[],i=[],r=[],o=[];let a=0,c=0;if(Array.isArray(e)===!1)l(e);else for(let h=0;h<e.length;h++)l(e[h]),this.addGroup(a,c,h),a+=c,c=0;this.setIndex(n),this.setAttribute("position",new qe(i,3)),this.setAttribute("normal",new qe(r,3)),this.setAttribute("uv",new qe(o,2));function l(h){const u=i.length/3,f=h.extractPoints(t);let d=f.shape;const x=f.holes;Bn.isClockWise(d)===!1&&(d=d.reverse());for(let g=0,m=x.length;g<m;g++){const _=x[g];Bn.isClockWise(_)===!0&&(x[g]=_.reverse())}const y=Bn.triangulateShape(d,x);for(let g=0,m=x.length;g<m;g++){const _=x[g];d=d.concat(_)}for(let g=0,m=d.length;g<m;g++){const _=d[g];i.push(_.x,_.y,0),r.push(0,0,1),o.push(_.x,_.y)}for(let g=0,m=y.length;g<m;g++){const _=y[g],p=_[0]+u,v=_[1]+u,T=_[2]+u;n.push(p,v,T),c+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON(),t=this.parameters.shapes;return hp(t,e)}static fromJSON(e,t){const n=[];for(let i=0,r=e.shapes.length;i<r;i++){const o=t[e.shapes[i]];n.push(o)}return new eu(n,e.curveSegments)}}function hp(s,e){if(e.shapes=[],Array.isArray(s))for(let t=0,n=s.length;t<n;t++){const i=s[t];e.shapes.push(i.uuid)}else e.shapes.push(s.uuid);return e}class it extends _t{constructor(e=1,t=32,n=16,i=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:i,phiLength:r,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));const c=Math.min(o+a,Math.PI);let l=0;const h=[],u=new I,f=new I,d=[],x=[],y=[],g=[];for(let m=0;m<=n;m++){const _=[],p=m/n;let v=0;m===0&&o===0?v=.5/t:m===n&&c===Math.PI&&(v=-.5/t);for(let T=0;T<=t;T++){const S=T/t;u.x=-e*Math.cos(i+S*r)*Math.sin(o+p*a),u.y=e*Math.cos(o+p*a),u.z=e*Math.sin(i+S*r)*Math.sin(o+p*a),x.push(u.x,u.y,u.z),f.copy(u).normalize(),y.push(f.x,f.y,f.z),g.push(S+v,1-p),_.push(l++)}h.push(_)}for(let m=0;m<n;m++)for(let _=0;_<t;_++){const p=h[m][_+1],v=h[m][_],T=h[m+1][_],S=h[m+1][_+1];(m!==0||o>0)&&d.push(p,v,S),(m!==n-1||c<Math.PI)&&d.push(v,T,S)}this.setIndex(d),this.setAttribute("position",new qe(x,3)),this.setAttribute("normal",new qe(y,3)),this.setAttribute("uv",new qe(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new it(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class kt extends _t{constructor(e=1,t=.4,n=12,i=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:i,arc:r},n=Math.floor(n),i=Math.floor(i);const o=[],a=[],c=[],l=[],h=new I,u=new I,f=new I;for(let d=0;d<=n;d++)for(let x=0;x<=i;x++){const y=x/i*r,g=d/n*Math.PI*2;u.x=(e+t*Math.cos(g))*Math.cos(y),u.y=(e+t*Math.cos(g))*Math.sin(y),u.z=t*Math.sin(g),a.push(u.x,u.y,u.z),h.x=e*Math.cos(y),h.y=e*Math.sin(y),f.subVectors(u,h).normalize(),c.push(f.x,f.y,f.z),l.push(x/i),l.push(d/n)}for(let d=1;d<=n;d++)for(let x=1;x<=i;x++){const y=(i+1)*d+x-1,g=(i+1)*(d-1)+x-1,m=(i+1)*(d-1)+x,_=(i+1)*d+x;o.push(y,g,_),o.push(g,m,_)}this.setIndex(o),this.setAttribute("position",new qe(a,3)),this.setAttribute("normal",new qe(c,3)),this.setAttribute("uv",new qe(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new kt(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}class tu extends _t{constructor(e=new Xh(new I(-1,-1,0),new I(-1,1,0),new I(1,1,0)),t=64,n=1,i=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:i,closed:r};const o=e.computeFrenetFrames(t,r);this.tangents=o.tangents,this.normals=o.normals,this.binormals=o.binormals;const a=new I,c=new I,l=new te;let h=new I;const u=[],f=[],d=[],x=[];y(),this.setIndex(x),this.setAttribute("position",new qe(u,3)),this.setAttribute("normal",new qe(f,3)),this.setAttribute("uv",new qe(d,2));function y(){for(let p=0;p<t;p++)g(p);g(r===!1?t:0),_(),m()}function g(p){h=e.getPointAt(p/t,h);const v=o.normals[p],T=o.binormals[p];for(let S=0;S<=i;S++){const w=S/i*Math.PI*2,L=Math.sin(w),b=-Math.cos(w);c.x=b*v.x+L*T.x,c.y=b*v.y+L*T.y,c.z=b*v.z+L*T.z,c.normalize(),f.push(c.x,c.y,c.z),a.x=h.x+n*c.x,a.y=h.y+n*c.y,a.z=h.z+n*c.z,u.push(a.x,a.y,a.z)}}function m(){for(let p=1;p<=t;p++)for(let v=1;v<=i;v++){const T=(i+1)*(p-1)+(v-1),S=(i+1)*p+(v-1),w=(i+1)*p+v,L=(i+1)*(p-1)+v;x.push(T,S,L),x.push(S,w,L)}}function _(){for(let p=0;p<=t;p++)for(let v=0;v<=i;v++)l.x=p/t,l.y=v/i,d.push(l.x,l.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new tu(new Gr[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}}class fn extends xn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ve(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ve(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Mh,this.normalScale=new te(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new En,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Rn extends fn{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new te(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return Ke(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Ve(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Ve(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Ve(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}class up extends xn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Md,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class dp extends xn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}function Er(s,e){return!s||s.constructor===e?s:typeof e.BYTES_PER_ELEMENT=="number"?new e(s):Array.prototype.slice.call(s)}function fp(s){return ArrayBuffer.isView(s)&&!(s instanceof DataView)}function pp(s){function e(i,r){return s[i]-s[r]}const t=s.length,n=new Array(t);for(let i=0;i!==t;++i)n[i]=i;return n.sort(e),n}function gl(s,e,t){const n=s.length,i=new s.constructor(n);for(let r=0,o=0;o!==n;++r){const a=t[r]*e;for(let c=0;c!==e;++c)i[o++]=s[a+c]}return i}function nu(s,e,t,n){let i=1,r=s[0];for(;r!==void 0&&r[n]===void 0;)r=s[i++];if(r===void 0)return;let o=r[n];if(o!==void 0)if(Array.isArray(o))do o=r[n],o!==void 0&&(e.push(r.time),t.push(...o)),r=s[i++];while(r!==void 0);else if(o.toArray!==void 0)do o=r[n],o!==void 0&&(e.push(r.time),o.toArray(t,t.length)),r=s[i++];while(r!==void 0);else do o=r[n],o!==void 0&&(e.push(r.time),t.push(o)),r=s[i++];while(r!==void 0)}class Ys{constructor(e,t,n,i){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){const t=this.parameterPositions;let n=this._cachedIndex,i=t[n],r=t[n-1];n:{e:{let o;t:{i:if(!(e<i)){for(let a=n+2;;){if(i===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=i,i=t[++n],e<i)break e}o=t.length;break t}if(!(e>=r)){const a=t[1];e<a&&(n=2,r=a);for(let c=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===c)break;if(i=r,r=t[--n-1],e>=r)break e}o=n,n=0;break t}break n}for(;n<o;){const a=n+o>>>1;e<t[a]?o=a:n=a+1}if(i=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,i)}return this.interpolate_(n,r,e,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=e*i;for(let o=0;o!==i;++o)t[o]=n[r+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}}class mp extends Ys{constructor(e,t,n,i){super(e,t,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:wc,endingEnd:wc}}intervalChanged_(e,t,n){const i=this.parameterPositions;let r=e-2,o=e+1,a=i[r],c=i[o];if(a===void 0)switch(this.getSettings_().endingStart){case Rc:r=e,a=2*t-n;break;case Cc:r=i.length-2,a=t+i[r]-i[r+1];break;default:r=e,a=n}if(c===void 0)switch(this.getSettings_().endingEnd){case Rc:o=e,c=2*n-t;break;case Cc:o=1,c=n+i[1]-i[0];break;default:o=e-1,c=t}const l=(n-t)*.5,h=this.valueSize;this._weightPrev=l/(t-a),this._weightNext=l/(c-n),this._offsetPrev=r*h,this._offsetNext=o*h}interpolate_(e,t,n,i){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,h=this._offsetPrev,u=this._offsetNext,f=this._weightPrev,d=this._weightNext,x=(n-t)/(i-t),y=x*x,g=y*x,m=-f*g+2*f*y-f*x,_=(1+f)*g+(-1.5-2*f)*y+(-.5+f)*x+1,p=(-1-d)*g+(1.5+d)*y+.5*x,v=d*g-d*y;for(let T=0;T!==a;++T)r[T]=m*o[h+T]+_*o[l+T]+p*o[c+T]+v*o[u+T];return r}}class xp extends Ys{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,h=(n-t)/(i-t),u=1-h;for(let f=0;f!==a;++f)r[f]=o[l+f]*u+o[c+f]*h;return r}}class gp extends Ys{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e){return this.copySampleValue_(e-1)}}class gn{constructor(e,t,n,i){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Er(t,this.TimeBufferType),this.values=Er(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(e){const t=e.constructor;let n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Er(e.times,Array),values:Er(e.values,Array)};const i=e.getInterpolation();i!==e.DefaultInterpolation&&(n.interpolation=i)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new gp(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new xp(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new mp(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case Bs:t=this.InterpolantFactoryMethodDiscrete;break;case zs:t=this.InterpolantFactoryMethodLinear;break;case Qr:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){const n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Pe("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Bs;case this.InterpolantFactoryMethodLinear:return zs;case this.InterpolantFactoryMethodSmooth:return Qr}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]+=e}return this}scale(e){if(e!==1){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]*=e}return this}trim(e,t){const n=this.times,i=n.length;let r=0,o=i-1;for(;r!==i&&n[r]<e;)++r;for(;o!==-1&&n[o]>t;)--o;if(++o,r!==0||o!==i){r>=o&&(o=Math.max(o,1),r=o-1);const a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let e=!0;const t=this.getValueSize();t-Math.floor(t)!==0&&($e("KeyframeTrack: Invalid value size in track.",this),e=!1);const n=this.times,i=this.values,r=n.length;r===0&&($e("KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==r;a++){const c=n[a];if(typeof c=="number"&&isNaN(c)){$e("KeyframeTrack: Time is not a valid number.",this,a,c),e=!1;break}if(o!==null&&o>c){$e("KeyframeTrack: Out of order keys.",this,a,c,o),e=!1;break}o=c}if(i!==void 0&&fp(i))for(let a=0,c=i.length;a!==c;++a){const l=i[a];if(isNaN(l)){$e("KeyframeTrack: Value is not a valid number.",this,a,l),e=!1;break}}return e}optimize(){const e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===Qr,r=e.length-1;let o=1;for(let a=1;a<r;++a){let c=!1;const l=e[a],h=e[a+1];if(l!==h&&(a!==1||l!==e[0]))if(i)c=!0;else{const u=a*n,f=u-n,d=u+n;for(let x=0;x!==n;++x){const y=t[u+x];if(y!==t[f+x]||y!==t[d+x]){c=!0;break}}}if(c){if(a!==o){e[o]=e[a];const u=a*n,f=o*n;for(let d=0;d!==n;++d)t[f+d]=t[u+d]}++o}}if(r>0){e[o]=e[r];for(let a=r*n,c=o*n,l=0;l!==n;++l)t[c+l]=t[a+l];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*n)):(this.times=e,this.values=t),this}clone(){const e=this.times.slice(),t=this.values.slice(),n=this.constructor,i=new n(this.name,e,t);return i.createInterpolant=this.createInterpolant,i}}gn.prototype.ValueTypeName="";gn.prototype.TimeBufferType=Float32Array;gn.prototype.ValueBufferType=Float32Array;gn.prototype.DefaultInterpolation=zs;class is extends gn{constructor(e,t,n){super(e,t,n)}}is.prototype.ValueTypeName="bool";is.prototype.ValueBufferType=Array;is.prototype.DefaultInterpolation=Bs;is.prototype.InterpolantFactoryMethodLinear=void 0;is.prototype.InterpolantFactoryMethodSmooth=void 0;class iu extends gn{constructor(e,t,n,i){super(e,t,n,i)}}iu.prototype.ValueTypeName="color";class Ji extends gn{constructor(e,t,n,i){super(e,t,n,i)}}Ji.prototype.ValueTypeName="number";class _p extends Ys{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=(n-t)/(i-t);let l=e*a;for(let h=l+a;l!==h;l+=4)ni.slerpFlat(r,0,o,l-a,o,l,c);return r}}class Zi extends gn{constructor(e,t,n,i){super(e,t,n,i)}InterpolantFactoryMethodLinear(e){return new _p(this.times,this.values,this.getValueSize(),e)}}Zi.prototype.ValueTypeName="quaternion";Zi.prototype.InterpolantFactoryMethodSmooth=void 0;class ss extends gn{constructor(e,t,n){super(e,t,n)}}ss.prototype.ValueTypeName="string";ss.prototype.ValueBufferType=Array;ss.prototype.DefaultInterpolation=Bs;ss.prototype.InterpolantFactoryMethodLinear=void 0;ss.prototype.InterpolantFactoryMethodSmooth=void 0;class Qi extends gn{constructor(e,t,n,i){super(e,t,n,i)}}Qi.prototype.ValueTypeName="vector";class vp{constructor(e="",t=-1,n=[],i=vd){this.name=e,this.tracks=n,this.duration=t,this.blendMode=i,this.uuid=cn(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){const t=[],n=e.tracks,i=1/(e.fps||1);for(let o=0,a=n.length;o!==a;++o)t.push(Mp(n[o]).scale(i));const r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r.userData=JSON.parse(e.userData||"{}"),r}static toJSON(e){const t=[],n=e.tracks,i={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let r=0,o=n.length;r!==o;++r)t.push(gn.toJSON(n[r]));return i}static CreateFromMorphTargetSequence(e,t,n,i){const r=t.length,o=[];for(let a=0;a<r;a++){let c=[],l=[];c.push((a+r-1)%r,a,(a+1)%r),l.push(0,1,0);const h=pp(c);c=gl(c,1,h),l=gl(l,1,h),!i&&c[0]===0&&(c.push(r),l.push(l[0])),o.push(new Ji(".morphTargetInfluences["+t[a].name+"]",c,l).scale(1/n))}return new this(e,-1,o)}static findByName(e,t){let n=e;if(!Array.isArray(e)){const i=e;n=i.geometry&&i.geometry.animations||i.animations}for(let i=0;i<n.length;i++)if(n[i].name===t)return n[i];return null}static CreateClipsFromMorphTargetSequences(e,t,n){const i={},r=/^([\w-]*?)([\d]+)$/;for(let a=0,c=e.length;a<c;a++){const l=e[a],h=l.name.match(r);if(h&&h.length>1){const u=h[1];let f=i[u];f||(i[u]=f=[]),f.push(l)}}const o=[];for(const a in i)o.push(this.CreateFromMorphTargetSequence(a,i[a],t,n));return o}static parseAnimation(e,t){if(Pe("AnimationClip: parseAnimation() is deprecated and will be removed with r185"),!e)return $e("AnimationClip: No animation in JSONLoader data."),null;const n=function(u,f,d,x,y){if(d.length!==0){const g=[],m=[];nu(d,g,m,x),g.length!==0&&y.push(new u(f,g,m))}},i=[],r=e.name||"default",o=e.fps||30,a=e.blendMode;let c=e.length||-1;const l=e.hierarchy||[];for(let u=0;u<l.length;u++){const f=l[u].keys;if(!(!f||f.length===0))if(f[0].morphTargets){const d={};let x;for(x=0;x<f.length;x++)if(f[x].morphTargets)for(let y=0;y<f[x].morphTargets.length;y++)d[f[x].morphTargets[y]]=-1;for(const y in d){const g=[],m=[];for(let _=0;_!==f[x].morphTargets.length;++_){const p=f[x];g.push(p.time),m.push(p.morphTarget===y?1:0)}i.push(new Ji(".morphTargetInfluence["+y+"]",g,m))}c=d.length*o}else{const d=".bones["+t[u].name+"]";n(Qi,d+".position",f,"pos",i),n(Zi,d+".quaternion",f,"rot",i),n(Qi,d+".scale",f,"scl",i)}}return i.length===0?null:new this(r,c,i,a)}resetDuration(){const e=this.tracks;let t=0;for(let n=0,i=e.length;n!==i;++n){const r=this.tracks[n];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){const e=[];for(let n=0;n<this.tracks.length;n++)e.push(this.tracks[n].clone());const t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}}function yp(s){switch(s.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Ji;case"vector":case"vector2":case"vector3":case"vector4":return Qi;case"color":return iu;case"quaternion":return Zi;case"bool":case"boolean":return is;case"string":return ss}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+s)}function Mp(s){if(s.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");const e=yp(s.type);if(s.times===void 0){const t=[],n=[];nu(s.keys,t,n,"value"),s.times=t,s.values=n}return e.parse!==void 0?e.parse(s):new e(s.name,s.times,s.values,s.interpolation)}const zn={enabled:!1,files:{},add:function(s,e){this.enabled!==!1&&(this.files[s]=e)},get:function(s){if(this.enabled!==!1)return this.files[s]},remove:function(s){delete this.files[s]},clear:function(){this.files={}}};class bp{constructor(e,t,n){const i=this;let r=!1,o=0,a=0,c;const l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(h){a++,r===!1&&i.onStart!==void 0&&i.onStart(h,o,a),r=!0},this.itemEnd=function(h){o++,i.onProgress!==void 0&&i.onProgress(h,o,a),o===a&&(r=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(h){i.onError!==void 0&&i.onError(h)},this.resolveURL=function(h){return c?c(h):h},this.setURLModifier=function(h){return c=h,this},this.addHandler=function(h,u){return l.push(h,u),this},this.removeHandler=function(h){const u=l.indexOf(h);return u!==-1&&l.splice(u,2),this},this.getHandler=function(h){for(let u=0,f=l.length;u<f;u+=2){const d=l[u],x=l[u+1];if(d.global&&(d.lastIndex=0),d.test(h))return x}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}}const Sp=new bp;class rs{constructor(e){this.manager=e!==void 0?e:Sp,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){const n=this;return new Promise(function(i,r){n.load(e,i,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}}rs.DEFAULT_MATERIAL_NAME="__DEFAULT";const Nn={};class Tp extends Error{constructor(e,t){super(e),this.response=t}}class su extends rs{constructor(e){super(e),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=zn.get(`file:${e}`);if(r!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0),r;if(Nn[e]!==void 0){Nn[e].push({onLoad:t,onProgress:n,onError:i});return}Nn[e]=[],Nn[e].push({onLoad:t,onProgress:n,onError:i});const o=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),a=this.mimeType,c=this.responseType;fetch(o).then(l=>{if(l.status===200||l.status===0){if(l.status===0&&Pe("FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||l.body===void 0||l.body.getReader===void 0)return l;const h=Nn[e],u=l.body.getReader(),f=l.headers.get("X-File-Size")||l.headers.get("Content-Length"),d=f?parseInt(f):0,x=d!==0;let y=0;const g=new ReadableStream({start(m){_();function _(){u.read().then(({done:p,value:v})=>{if(p)m.close();else{y+=v.byteLength;const T=new ProgressEvent("progress",{lengthComputable:x,loaded:y,total:d});for(let S=0,w=h.length;S<w;S++){const L=h[S];L.onProgress&&L.onProgress(T)}m.enqueue(v),_()}},p=>{m.error(p)})}}});return new Response(g)}else throw new Tp(`fetch for "${l.url}" responded with ${l.status}: ${l.statusText}`,l)}).then(l=>{switch(c){case"arraybuffer":return l.arrayBuffer();case"blob":return l.blob();case"document":return l.text().then(h=>new DOMParser().parseFromString(h,a));case"json":return l.json();default:if(a==="")return l.text();{const u=/charset="?([^;"\s]*)"?/i.exec(a),f=u&&u[1]?u[1].toLowerCase():void 0,d=new TextDecoder(f);return l.arrayBuffer().then(x=>d.decode(x))}}}).then(l=>{zn.add(`file:${e}`,l);const h=Nn[e];delete Nn[e];for(let u=0,f=h.length;u<f;u++){const d=h[u];d.onLoad&&d.onLoad(l)}}).catch(l=>{const h=Nn[e];if(h===void 0)throw this.manager.itemError(e),l;delete Nn[e];for(let u=0,f=h.length;u<f;u++){const d=h[u];d.onError&&d.onError(l)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}const Oi=new WeakMap;class Ep extends rs{constructor(e){super(e)}load(e,t,n,i){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,o=zn.get(`image:${e}`);if(o!==void 0){if(o.complete===!0)r.manager.itemStart(e),setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0);else{let u=Oi.get(o);u===void 0&&(u=[],Oi.set(o,u)),u.push({onLoad:t,onError:i})}return o}const a=ks("img");function c(){h(),t&&t(this);const u=Oi.get(this)||[];for(let f=0;f<u.length;f++){const d=u[f];d.onLoad&&d.onLoad(this)}Oi.delete(this),r.manager.itemEnd(e)}function l(u){h(),i&&i(u),zn.remove(`image:${e}`);const f=Oi.get(this)||[];for(let d=0;d<f.length;d++){const x=f[d];x.onError&&x.onError(u)}Oi.delete(this),r.manager.itemError(e),r.manager.itemEnd(e)}function h(){a.removeEventListener("load",c,!1),a.removeEventListener("error",l,!1)}return a.addEventListener("load",c,!1),a.addEventListener("error",l,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),zn.add(`image:${e}`,a),r.manager.itemStart(e),a.src=e,a}}class Ap extends rs{constructor(e){super(e)}load(e,t,n,i){const r=new Rt,o=new Ep(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){r.image=a,r.needsUpdate=!0,t!==void 0&&t(r)},n,i),r}}class $r extends gt{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ve(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}class Xv extends $r{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(gt.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ve(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}}const Po=new We,_l=new I,vl=new I;class ac{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new te(512,512),this.mapType=Tn,this.map=null,this.mapPass=null,this.matrix=new We,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new nc,this._frameExtents=new te(1,1),this._viewportCount=1,this._viewports=[new ot(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;_l.setFromMatrixPosition(e.matrixWorld),t.position.copy(_l),vl.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(vl),t.updateMatrixWorld(),Po.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Po,t.coordinateSystem,t.reversedDepth),t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Po)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class wp extends ac{constructor(){super(new Xt(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){const t=this.camera,n=$i*2*e.angle*this.focus,i=this.mapSize.width/this.mapSize.height*this.aspect,r=e.distance||t.far;(n!==t.fov||i!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=i,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class Rp extends $r{constructor(e,t,n=0,i=Math.PI/3,r=0,o=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(gt.DEFAULT_UP),this.updateMatrix(),this.target=new gt,this.distance=n,this.angle=i,this.penumbra=r,this.decay=o,this.map=null,this.shadow=new wp}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}const yl=new We,vs=new I,Lo=new I;class Cp extends ac{constructor(){super(new Xt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new te(4,2),this._viewportCount=6,this._viewports=[new ot(2,1,1,1),new ot(0,1,1,1),new ot(3,1,1,1),new ot(1,1,1,1),new ot(3,0,1,1),new ot(1,0,1,1)],this._cubeDirections=[new I(1,0,0),new I(-1,0,0),new I(0,0,1),new I(0,0,-1),new I(0,1,0),new I(0,-1,0)],this._cubeUps=[new I(0,1,0),new I(0,1,0),new I(0,1,0),new I(0,1,0),new I(0,0,1),new I(0,0,-1)]}updateMatrices(e,t=0){const n=this.camera,i=this.matrix,r=e.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),vs.setFromMatrixPosition(e.matrixWorld),n.position.copy(vs),Lo.copy(n.position),Lo.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(Lo),n.updateMatrixWorld(),i.makeTranslation(-vs.x,-vs.y,-vs.z),yl.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(yl,n.coordinateSystem,n.reversedDepth)}}class Pp extends $r{constructor(e,t,n=0,i=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new Cp}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class cc extends Ch{constructor(e=-1,t=1,n=1,i=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=i,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,i,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2;let r=n-e,o=n+e,a=i+t,c=i-t;if(this.view!==null&&this.view.enabled){const l=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,o=r+l*this.view.width,a-=h*this.view.offsetY,c=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class Lp extends ac{constructor(){super(new cc(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Ip extends $r{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(gt.DEFAULT_UP),this.updateMatrix(),this.target=new gt,this.shadow=new Lp}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class Ps{static extractUrlBase(e){const t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}}const Io=new WeakMap;class Dp extends rs{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&Pe("ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&Pe("ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"},this._abortController=new AbortController}setOptions(e){return this.options=e,this}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,o=zn.get(`image-bitmap:${e}`);if(o!==void 0){if(r.manager.itemStart(e),o.then){o.then(l=>{if(Io.has(o)===!0)i&&i(Io.get(o)),r.manager.itemError(e),r.manager.itemEnd(e);else return t&&t(l),r.manager.itemEnd(e),l});return}return setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0),o}const a={};a.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",a.headers=this.requestHeader,a.signal=typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;const c=fetch(e,a).then(function(l){return l.blob()}).then(function(l){return createImageBitmap(l,Object.assign(r.options,{colorSpaceConversion:"none"}))}).then(function(l){return zn.add(`image-bitmap:${e}`,l),t&&t(l),r.manager.itemEnd(e),l}).catch(function(l){i&&i(l),Io.set(c,l),zn.remove(`image-bitmap:${e}`),r.manager.itemError(e),r.manager.itemEnd(e)});zn.add(`image-bitmap:${e}`,c),r.manager.itemStart(e)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}class Np extends Xt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}class qv{constructor(e=!0){this.autoStart=e,this.startTime=0,this.oldTime=0,this.elapsedTime=0,this.running=!1}start(){this.startTime=performance.now(),this.oldTime=this.startTime,this.elapsedTime=0,this.running=!0}stop(){this.getElapsedTime(),this.running=!1,this.autoStart=!1}getElapsedTime(){return this.getDelta(),this.elapsedTime}getDelta(){let e=0;if(this.autoStart&&!this.running)return this.start(),0;if(this.running){const t=performance.now();e=(t-this.oldTime)/1e3,this.oldTime=t,this.elapsedTime+=e}return e}}const lc="\\[\\]\\.:\\/",Up=new RegExp("["+lc+"]","g"),hc="[^"+lc+"]",Fp="[^"+lc.replace("\\.","")+"]",Op=/((?:WC+[\/:])*)/.source.replace("WC",hc),Bp=/(WCOD+)?/.source.replace("WCOD",Fp),zp=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",hc),kp=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",hc),Vp=new RegExp("^"+Op+Bp+zp+kp+"$"),Gp=["material","materials","bones","map"];class Hp{constructor(e,t,n){const i=n||lt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,i)}getValue(e,t){this.bind();const n=this._targetGroup.nCachedObjects_,i=this._bindings[n];i!==void 0&&i.getValue(e,t)}setValue(e,t){const n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,r=n.length;i!==r;++i)n[i].setValue(e,t)}bind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}}class lt{constructor(e,t,n){this.path=t,this.parsedPath=n||lt.parseTrackName(t),this.node=lt.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new lt.Composite(e,t,n):new lt(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(Up,"")}static parseTrackName(e){const t=Vp.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);const n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){const r=n.nodeName.substring(i+1);Gp.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,i),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){const n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){const n=function(r){for(let o=0;o<r.length;o++){const a=r[o];if(a.name===t||a.uuid===t)return a;const c=n(a.children);if(c)return c}return null},i=n(e.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)e[t++]=n[i]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++]}_setValue_array_setNeedsUpdate(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node;const t=this.parsedPath,n=t.objectName,i=t.propertyName;let r=t.propertyIndex;if(e||(e=lt.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){Pe("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let l=t.objectIndex;switch(n){case"materials":if(!e.material){$e("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){$e("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){$e("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===l){l=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){$e("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){$e("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){$e("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(l!==void 0){if(e[l]===void 0){$e("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[l]}}const o=e[i];if(o===void 0){const l=t.nodeName;$e("PropertyBinding: Trying to update property for track: "+l+"."+i+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?a=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(r!==void 0){if(i==="morphTargetInfluences"){if(!e.geometry){$e("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){$e("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}lt.Composite=Hp;lt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};lt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};lt.prototype.GetterByBindingType=[lt.prototype._getValue_direct,lt.prototype._getValue_array,lt.prototype._getValue_arrayElement,lt.prototype._getValue_toArray];lt.prototype.SetterByBindingTypeAndVersioning=[[lt.prototype._setValue_direct,lt.prototype._setValue_direct_setNeedsUpdate,lt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[lt.prototype._setValue_array,lt.prototype._setValue_array_setNeedsUpdate,lt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[lt.prototype._setValue_arrayElement,lt.prototype._setValue_arrayElement_setNeedsUpdate,lt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[lt.prototype._setValue_fromArray,lt.prototype._setValue_fromArray_setNeedsUpdate,lt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];const Ml=new We;class Yv{constructor(e,t,n=0,i=1/0){this.ray=new qs(e,t),this.near=n,this.far=i,this.camera=null,this.layers=new Za,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,(t.near+t.far)/(t.near-t.far)).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):$e("Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return Ml.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Ml),this}intersectObject(e,t=!0,n=[]){return Ua(e,this,n,t),n.sort(bl),n}intersectObjects(e,t=!0,n=[]){for(let i=0,r=e.length;i<r;i++)Ua(e[i],this,n,t);return n.sort(bl),n}}function bl(s,e){return s.distance-e.distance}function Ua(s,e,t,n){let i=!0;if(s.layers.test(e.layers)&&s.raycast(e,t)===!1&&(i=!1),i===!0&&n===!0){const r=s.children;for(let o=0,a=r.length;o<a;o++)Ua(r[o],e,t,!0)}}function Sl(s,e,t,n){const i=Wp(n);switch(t){case _h:return s*e;case Xa:return s*e/i.components*i.byteLength;case qa:return s*e/i.components*i.byteLength;case Ya:return s*e*2/i.components*i.byteLength;case $a:return s*e*2/i.components*i.byteLength;case vh:return s*e*3/i.components*i.byteLength;case an:return s*e*4/i.components*i.byteLength;case Ka:return s*e*4/i.components*i.byteLength;case Lr:case Ir:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case Dr:case Nr:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case na:case sa:return Math.max(s,16)*Math.max(e,8)/4;case ta:case ia:return Math.max(s,8)*Math.max(e,8)/2;case ra:case oa:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case aa:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case ca:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case la:return Math.floor((s+4)/5)*Math.floor((e+3)/4)*16;case ha:return Math.floor((s+4)/5)*Math.floor((e+4)/5)*16;case ua:return Math.floor((s+5)/6)*Math.floor((e+4)/5)*16;case da:return Math.floor((s+5)/6)*Math.floor((e+5)/6)*16;case fa:return Math.floor((s+7)/8)*Math.floor((e+4)/5)*16;case pa:return Math.floor((s+7)/8)*Math.floor((e+5)/6)*16;case ma:return Math.floor((s+7)/8)*Math.floor((e+7)/8)*16;case xa:return Math.floor((s+9)/10)*Math.floor((e+4)/5)*16;case ga:return Math.floor((s+9)/10)*Math.floor((e+5)/6)*16;case _a:return Math.floor((s+9)/10)*Math.floor((e+7)/8)*16;case va:return Math.floor((s+9)/10)*Math.floor((e+9)/10)*16;case ya:return Math.floor((s+11)/12)*Math.floor((e+9)/10)*16;case Ma:return Math.floor((s+11)/12)*Math.floor((e+11)/12)*16;case ba:case Sa:case Ta:return Math.ceil(s/4)*Math.ceil(e/4)*16;case Ea:case Aa:return Math.ceil(s/4)*Math.ceil(e/4)*8;case wa:case Ra:return Math.ceil(s/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Wp(s){switch(s){case Tn:case ph:return{byteLength:1,components:1};case Ns:case mh:case ts:return{byteLength:2,components:1};case Ha:case Wa:return{byteLength:2,components:4};case mi:case Ga:case mn:return{byteLength:4,components:1};case xh:case gh:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${s}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Va}}));typeof window<"u"&&(window.__THREE__?Pe("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Va);function ru(){let s=null,e=!1,t=null,n=null;function i(r,o){t(r,o),n=s.requestAnimationFrame(i)}return{start:function(){e!==!0&&t!==null&&(n=s.requestAnimationFrame(i),e=!0)},stop:function(){s.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){s=r}}}function Xp(s){const e=new WeakMap;function t(a,c){const l=a.array,h=a.usage,u=l.byteLength,f=s.createBuffer();s.bindBuffer(c,f),s.bufferData(c,l,h),a.onUploadCallback();let d;if(l instanceof Float32Array)d=s.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)d=s.HALF_FLOAT;else if(l instanceof Uint16Array)a.isFloat16BufferAttribute?d=s.HALF_FLOAT:d=s.UNSIGNED_SHORT;else if(l instanceof Int16Array)d=s.SHORT;else if(l instanceof Uint32Array)d=s.UNSIGNED_INT;else if(l instanceof Int32Array)d=s.INT;else if(l instanceof Int8Array)d=s.BYTE;else if(l instanceof Uint8Array)d=s.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)d=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:f,type:d,bytesPerElement:l.BYTES_PER_ELEMENT,version:a.version,size:u}}function n(a,c,l){const h=c.array,u=c.updateRanges;if(s.bindBuffer(l,a),u.length===0)s.bufferSubData(l,0,h);else{u.sort((d,x)=>d.start-x.start);let f=0;for(let d=1;d<u.length;d++){const x=u[f],y=u[d];y.start<=x.start+x.count+1?x.count=Math.max(x.count,y.start+y.count-x.start):(++f,u[f]=y)}u.length=f+1;for(let d=0,x=u.length;d<x;d++){const y=u[d];s.bufferSubData(l,y.start*h.BYTES_PER_ELEMENT,h,y.start,y.count)}c.clearUpdateRanges()}c.onUploadCallback()}function i(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);const c=e.get(a);c&&(s.deleteBuffer(c.buffer),e.delete(a))}function o(a,c){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const h=e.get(a);(!h||h.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const l=e.get(a);if(l===void 0)e.set(a,t(a,c));else if(l.version<a.version){if(l.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(l.buffer,a,c),l.version=a.version}}return{get:i,remove:r,update:o}}var qp=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Yp=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,$p=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Kp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,jp=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Jp=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Zp=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Qp=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,e0=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,t0=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,n0=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,i0=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,s0=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,r0=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,o0=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,a0=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,c0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,l0=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,h0=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,u0=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,d0=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,f0=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,p0=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,m0=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,x0=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,g0=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,_0=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,v0=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,y0=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,M0=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,b0="gl_FragColor = linearToOutputTexel( gl_FragColor );",S0=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,T0=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,E0=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,A0=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,w0=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,R0=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,C0=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,P0=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,L0=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,I0=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,D0=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,N0=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,U0=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,F0=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,O0=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,B0=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,z0=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,k0=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,V0=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,G0=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,H0=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,W0=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 uv = vec2( roughness, dotNV );
	return texture2D( dfgLUT, uv ).rg;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
vec3 BRDF_GGX_Multiscatter( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 singleScatter = BRDF_GGX( lightDir, viewDir, normal, material );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 dfgV = DFGApprox( vec3(0.0, 0.0, 1.0), vec3(sqrt(1.0 - dotNV * dotNV), 0.0, dotNV), material.roughness );
	vec2 dfgL = DFGApprox( vec3(0.0, 0.0, 1.0), vec3(sqrt(1.0 - dotNL * dotNL), 0.0, dotNL), material.roughness );
	vec3 FssEss_V = material.specularColor * dfgV.x + material.specularF90 * dfgV.y;
	vec3 FssEss_L = material.specularColor * dfgL.x + material.specularF90 * dfgL.y;
	float Ess_V = dfgV.x + dfgV.y;
	float Ess_L = dfgL.x + dfgL.y;
	float Ems_V = 1.0 - Ess_V;
	float Ems_L = 1.0 - Ess_L;
	vec3 Favg = material.specularColor + ( 1.0 - material.specularColor ) * 0.047619;
	vec3 Fms = FssEss_V * FssEss_L * Favg / ( 1.0 - Ems_V * Ems_L * Favg * Favg + EPSILON );
	float compensationFactor = Ems_V * Ems_L;
	vec3 multiScatter = Fms * compensationFactor;
	return singleScatter + multiScatter;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX_Multiscatter( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,X0=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,q0=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Y0=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,$0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,K0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,j0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,J0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Z0=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Q0=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,em=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,tm=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,nm=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,im=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,sm=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,rm=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,om=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,am=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,cm=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,lm=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,hm=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,um=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,dm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,fm=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,pm=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,mm=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,xm=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,gm=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,_m=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,vm=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,ym=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,Mm=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,bm=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Sm=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Tm=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Em=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Am=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,wm=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,Rm=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Cm=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Pm=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,Lm=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Im=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Dm=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Nm=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Um=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Fm=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Om=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Bm=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,zm=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,km=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Vm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Gm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Hm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Wm=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Xm=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,qm=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Ym=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,$m=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Km=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,jm=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Jm=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Zm=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Qm=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,ex=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,tx=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,nx=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,ix=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,sx=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,rx=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,ox=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ax=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,cx=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,lx=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,hx=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ux=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,dx=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,fx=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,px=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,mx=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,xx=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,gx=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,_x=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,vx=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,yx=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Mx=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,bx=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Sx=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Tx=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Ye={alphahash_fragment:qp,alphahash_pars_fragment:Yp,alphamap_fragment:$p,alphamap_pars_fragment:Kp,alphatest_fragment:jp,alphatest_pars_fragment:Jp,aomap_fragment:Zp,aomap_pars_fragment:Qp,batching_pars_vertex:e0,batching_vertex:t0,begin_vertex:n0,beginnormal_vertex:i0,bsdfs:s0,iridescence_fragment:r0,bumpmap_pars_fragment:o0,clipping_planes_fragment:a0,clipping_planes_pars_fragment:c0,clipping_planes_pars_vertex:l0,clipping_planes_vertex:h0,color_fragment:u0,color_pars_fragment:d0,color_pars_vertex:f0,color_vertex:p0,common:m0,cube_uv_reflection_fragment:x0,defaultnormal_vertex:g0,displacementmap_pars_vertex:_0,displacementmap_vertex:v0,emissivemap_fragment:y0,emissivemap_pars_fragment:M0,colorspace_fragment:b0,colorspace_pars_fragment:S0,envmap_fragment:T0,envmap_common_pars_fragment:E0,envmap_pars_fragment:A0,envmap_pars_vertex:w0,envmap_physical_pars_fragment:B0,envmap_vertex:R0,fog_vertex:C0,fog_pars_vertex:P0,fog_fragment:L0,fog_pars_fragment:I0,gradientmap_pars_fragment:D0,lightmap_pars_fragment:N0,lights_lambert_fragment:U0,lights_lambert_pars_fragment:F0,lights_pars_begin:O0,lights_toon_fragment:z0,lights_toon_pars_fragment:k0,lights_phong_fragment:V0,lights_phong_pars_fragment:G0,lights_physical_fragment:H0,lights_physical_pars_fragment:W0,lights_fragment_begin:X0,lights_fragment_maps:q0,lights_fragment_end:Y0,logdepthbuf_fragment:$0,logdepthbuf_pars_fragment:K0,logdepthbuf_pars_vertex:j0,logdepthbuf_vertex:J0,map_fragment:Z0,map_pars_fragment:Q0,map_particle_fragment:em,map_particle_pars_fragment:tm,metalnessmap_fragment:nm,metalnessmap_pars_fragment:im,morphinstance_vertex:sm,morphcolor_vertex:rm,morphnormal_vertex:om,morphtarget_pars_vertex:am,morphtarget_vertex:cm,normal_fragment_begin:lm,normal_fragment_maps:hm,normal_pars_fragment:um,normal_pars_vertex:dm,normal_vertex:fm,normalmap_pars_fragment:pm,clearcoat_normal_fragment_begin:mm,clearcoat_normal_fragment_maps:xm,clearcoat_pars_fragment:gm,iridescence_pars_fragment:_m,opaque_fragment:vm,packing:ym,premultiplied_alpha_fragment:Mm,project_vertex:bm,dithering_fragment:Sm,dithering_pars_fragment:Tm,roughnessmap_fragment:Em,roughnessmap_pars_fragment:Am,shadowmap_pars_fragment:wm,shadowmap_pars_vertex:Rm,shadowmap_vertex:Cm,shadowmask_pars_fragment:Pm,skinbase_vertex:Lm,skinning_pars_vertex:Im,skinning_vertex:Dm,skinnormal_vertex:Nm,specularmap_fragment:Um,specularmap_pars_fragment:Fm,tonemapping_fragment:Om,tonemapping_pars_fragment:Bm,transmission_fragment:zm,transmission_pars_fragment:km,uv_pars_fragment:Vm,uv_pars_vertex:Gm,uv_vertex:Hm,worldpos_vertex:Wm,background_vert:Xm,background_frag:qm,backgroundCube_vert:Ym,backgroundCube_frag:$m,cube_vert:Km,cube_frag:jm,depth_vert:Jm,depth_frag:Zm,distanceRGBA_vert:Qm,distanceRGBA_frag:ex,equirect_vert:tx,equirect_frag:nx,linedashed_vert:ix,linedashed_frag:sx,meshbasic_vert:rx,meshbasic_frag:ox,meshlambert_vert:ax,meshlambert_frag:cx,meshmatcap_vert:lx,meshmatcap_frag:hx,meshnormal_vert:ux,meshnormal_frag:dx,meshphong_vert:fx,meshphong_frag:px,meshphysical_vert:mx,meshphysical_frag:xx,meshtoon_vert:gx,meshtoon_frag:_x,points_vert:vx,points_frag:yx,shadow_vert:Mx,shadow_frag:bx,sprite_vert:Sx,sprite_frag:Tx},pe={common:{diffuse:{value:new Ve(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Xe},alphaMap:{value:null},alphaMapTransform:{value:new Xe},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Xe}},envmap:{envMap:{value:null},envMapRotation:{value:new Xe},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Xe}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Xe}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Xe},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Xe},normalScale:{value:new te(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Xe},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Xe}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Xe}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Xe}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ve(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ve(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Xe},alphaTest:{value:0},uvTransform:{value:new Xe}},sprite:{diffuse:{value:new Ve(16777215)},opacity:{value:1},center:{value:new te(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Xe},alphaMap:{value:null},alphaMapTransform:{value:new Xe},alphaTest:{value:0}}},yn={basic:{uniforms:Bt([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.fog]),vertexShader:Ye.meshbasic_vert,fragmentShader:Ye.meshbasic_frag},lambert:{uniforms:Bt([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,pe.lights,{emissive:{value:new Ve(0)}}]),vertexShader:Ye.meshlambert_vert,fragmentShader:Ye.meshlambert_frag},phong:{uniforms:Bt([pe.common,pe.specularmap,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,pe.lights,{emissive:{value:new Ve(0)},specular:{value:new Ve(1118481)},shininess:{value:30}}]),vertexShader:Ye.meshphong_vert,fragmentShader:Ye.meshphong_frag},standard:{uniforms:Bt([pe.common,pe.envmap,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.roughnessmap,pe.metalnessmap,pe.fog,pe.lights,{emissive:{value:new Ve(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ye.meshphysical_vert,fragmentShader:Ye.meshphysical_frag},toon:{uniforms:Bt([pe.common,pe.aomap,pe.lightmap,pe.emissivemap,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.gradientmap,pe.fog,pe.lights,{emissive:{value:new Ve(0)}}]),vertexShader:Ye.meshtoon_vert,fragmentShader:Ye.meshtoon_frag},matcap:{uniforms:Bt([pe.common,pe.bumpmap,pe.normalmap,pe.displacementmap,pe.fog,{matcap:{value:null}}]),vertexShader:Ye.meshmatcap_vert,fragmentShader:Ye.meshmatcap_frag},points:{uniforms:Bt([pe.points,pe.fog]),vertexShader:Ye.points_vert,fragmentShader:Ye.points_frag},dashed:{uniforms:Bt([pe.common,pe.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ye.linedashed_vert,fragmentShader:Ye.linedashed_frag},depth:{uniforms:Bt([pe.common,pe.displacementmap]),vertexShader:Ye.depth_vert,fragmentShader:Ye.depth_frag},normal:{uniforms:Bt([pe.common,pe.bumpmap,pe.normalmap,pe.displacementmap,{opacity:{value:1}}]),vertexShader:Ye.meshnormal_vert,fragmentShader:Ye.meshnormal_frag},sprite:{uniforms:Bt([pe.sprite,pe.fog]),vertexShader:Ye.sprite_vert,fragmentShader:Ye.sprite_frag},background:{uniforms:{uvTransform:{value:new Xe},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ye.background_vert,fragmentShader:Ye.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Xe}},vertexShader:Ye.backgroundCube_vert,fragmentShader:Ye.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ye.cube_vert,fragmentShader:Ye.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ye.equirect_vert,fragmentShader:Ye.equirect_frag},distanceRGBA:{uniforms:Bt([pe.common,pe.displacementmap,{referencePosition:{value:new I},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ye.distanceRGBA_vert,fragmentShader:Ye.distanceRGBA_frag},shadow:{uniforms:Bt([pe.lights,pe.fog,{color:{value:new Ve(0)},opacity:{value:1}}]),vertexShader:Ye.shadow_vert,fragmentShader:Ye.shadow_frag}};yn.physical={uniforms:Bt([yn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Xe},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Xe},clearcoatNormalScale:{value:new te(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Xe},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Xe},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Xe},sheen:{value:0},sheenColor:{value:new Ve(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Xe},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Xe},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Xe},transmissionSamplerSize:{value:new te},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Xe},attenuationDistance:{value:0},attenuationColor:{value:new Ve(0)},specularColor:{value:new Ve(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Xe},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Xe},anisotropyVector:{value:new te},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Xe}}]),vertexShader:Ye.meshphysical_vert,fragmentShader:Ye.meshphysical_frag};const Ar={r:0,b:0,g:0},li=new En,Ex=new We;function Ax(s,e,t,n,i,r,o){const a=new Ve(0);let c=r===!0?0:1,l,h,u=null,f=0,d=null;function x(p){let v=p.isScene===!0?p.background:null;return v&&v.isTexture&&(v=(p.backgroundBlurriness>0?t:e).get(v)),v}function y(p){let v=!1;const T=x(p);T===null?m(a,c):T&&T.isColor&&(m(T,1),v=!0);const S=s.xr.getEnvironmentBlendMode();S==="additive"?n.buffers.color.setClear(0,0,0,1,o):S==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(s.autoClear||v)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function g(p,v){const T=x(v);T&&(T.isCubeTexture||T.mapping===Wr)?(h===void 0&&(h=new Ze(new Yt(1,1,1),new Hn({name:"BackgroundCubeMaterial",uniforms:Ki(yn.backgroundCube.uniforms),vertexShader:yn.backgroundCube.vertexShader,fragmentShader:yn.backgroundCube.fragmentShader,side:qt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(S,w,L){this.matrixWorld.copyPosition(L.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(h)),li.copy(v.backgroundRotation),li.x*=-1,li.y*=-1,li.z*=-1,T.isCubeTexture&&T.isRenderTargetTexture===!1&&(li.y*=-1,li.z*=-1),h.material.uniforms.envMap.value=T,h.material.uniforms.flipEnvMap.value=T.isCubeTexture&&T.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=v.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(Ex.makeRotationFromEuler(li)),h.material.toneMapped=nt.getTransfer(T.colorSpace)!==dt,(u!==T||f!==T.version||d!==s.toneMapping)&&(h.material.needsUpdate=!0,u=T,f=T.version,d=s.toneMapping),h.layers.enableAll(),p.unshift(h,h.geometry,h.material,0,0,null)):T&&T.isTexture&&(l===void 0&&(l=new Ze(new Yr(2,2),new Hn({name:"BackgroundMaterial",uniforms:Ki(yn.background.uniforms),vertexShader:yn.background.vertexShader,fragmentShader:yn.background.fragmentShader,side:Gn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(l)),l.material.uniforms.t2D.value=T,l.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,l.material.toneMapped=nt.getTransfer(T.colorSpace)!==dt,T.matrixAutoUpdate===!0&&T.updateMatrix(),l.material.uniforms.uvTransform.value.copy(T.matrix),(u!==T||f!==T.version||d!==s.toneMapping)&&(l.material.needsUpdate=!0,u=T,f=T.version,d=s.toneMapping),l.layers.enableAll(),p.unshift(l,l.geometry,l.material,0,0,null))}function m(p,v){p.getRGB(Ar,Rh(s)),n.buffers.color.setClear(Ar.r,Ar.g,Ar.b,v,o)}function _(){h!==void 0&&(h.geometry.dispose(),h.material.dispose(),h=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(p,v=1){a.set(p),c=v,m(a,c)},getClearAlpha:function(){return c},setClearAlpha:function(p){c=p,m(a,c)},render:y,addToRenderList:g,dispose:_}}function wx(s,e){const t=s.getParameter(s.MAX_VERTEX_ATTRIBS),n={},i=f(null);let r=i,o=!1;function a(M,C,D,F,k){let z=!1;const V=u(F,D,C);r!==V&&(r=V,l(r.object)),z=d(M,F,D,k),z&&x(M,F,D,k),k!==null&&e.update(k,s.ELEMENT_ARRAY_BUFFER),(z||o)&&(o=!1,v(M,C,D,F),k!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,e.get(k).buffer))}function c(){return s.createVertexArray()}function l(M){return s.bindVertexArray(M)}function h(M){return s.deleteVertexArray(M)}function u(M,C,D){const F=D.wireframe===!0;let k=n[M.id];k===void 0&&(k={},n[M.id]=k);let z=k[C.id];z===void 0&&(z={},k[C.id]=z);let V=z[F];return V===void 0&&(V=f(c()),z[F]=V),V}function f(M){const C=[],D=[],F=[];for(let k=0;k<t;k++)C[k]=0,D[k]=0,F[k]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:C,enabledAttributes:D,attributeDivisors:F,object:M,attributes:{},index:null}}function d(M,C,D,F){const k=r.attributes,z=C.attributes;let V=0;const Y=D.getAttributes();for(const G in Y)if(Y[G].location>=0){const oe=k[G];let Ae=z[G];if(Ae===void 0&&(G==="instanceMatrix"&&M.instanceMatrix&&(Ae=M.instanceMatrix),G==="instanceColor"&&M.instanceColor&&(Ae=M.instanceColor)),oe===void 0||oe.attribute!==Ae||Ae&&oe.data!==Ae.data)return!0;V++}return r.attributesNum!==V||r.index!==F}function x(M,C,D,F){const k={},z=C.attributes;let V=0;const Y=D.getAttributes();for(const G in Y)if(Y[G].location>=0){let oe=z[G];oe===void 0&&(G==="instanceMatrix"&&M.instanceMatrix&&(oe=M.instanceMatrix),G==="instanceColor"&&M.instanceColor&&(oe=M.instanceColor));const Ae={};Ae.attribute=oe,oe&&oe.data&&(Ae.data=oe.data),k[G]=Ae,V++}r.attributes=k,r.attributesNum=V,r.index=F}function y(){const M=r.newAttributes;for(let C=0,D=M.length;C<D;C++)M[C]=0}function g(M){m(M,0)}function m(M,C){const D=r.newAttributes,F=r.enabledAttributes,k=r.attributeDivisors;D[M]=1,F[M]===0&&(s.enableVertexAttribArray(M),F[M]=1),k[M]!==C&&(s.vertexAttribDivisor(M,C),k[M]=C)}function _(){const M=r.newAttributes,C=r.enabledAttributes;for(let D=0,F=C.length;D<F;D++)C[D]!==M[D]&&(s.disableVertexAttribArray(D),C[D]=0)}function p(M,C,D,F,k,z,V){V===!0?s.vertexAttribIPointer(M,C,D,k,z):s.vertexAttribPointer(M,C,D,F,k,z)}function v(M,C,D,F){y();const k=F.attributes,z=D.getAttributes(),V=C.defaultAttributeValues;for(const Y in z){const G=z[Y];if(G.location>=0){let ne=k[Y];if(ne===void 0&&(Y==="instanceMatrix"&&M.instanceMatrix&&(ne=M.instanceMatrix),Y==="instanceColor"&&M.instanceColor&&(ne=M.instanceColor)),ne!==void 0){const oe=ne.normalized,Ae=ne.itemSize,je=e.get(ne);if(je===void 0)continue;const et=je.buffer,rt=je.type,at=je.bytesPerElement,$=rt===s.INT||rt===s.UNSIGNED_INT||ne.gpuType===Ga;if(ne.isInterleavedBufferAttribute){const J=ne.data,ye=J.stride,De=ne.offset;if(J.isInstancedInterleavedBuffer){for(let Re=0;Re<G.locationSize;Re++)m(G.location+Re,J.meshPerAttribute);M.isInstancedMesh!==!0&&F._maxInstanceCount===void 0&&(F._maxInstanceCount=J.meshPerAttribute*J.count)}else for(let Re=0;Re<G.locationSize;Re++)g(G.location+Re);s.bindBuffer(s.ARRAY_BUFFER,et);for(let Re=0;Re<G.locationSize;Re++)p(G.location+Re,Ae/G.locationSize,rt,oe,ye*at,(De+Ae/G.locationSize*Re)*at,$)}else{if(ne.isInstancedBufferAttribute){for(let J=0;J<G.locationSize;J++)m(G.location+J,ne.meshPerAttribute);M.isInstancedMesh!==!0&&F._maxInstanceCount===void 0&&(F._maxInstanceCount=ne.meshPerAttribute*ne.count)}else for(let J=0;J<G.locationSize;J++)g(G.location+J);s.bindBuffer(s.ARRAY_BUFFER,et);for(let J=0;J<G.locationSize;J++)p(G.location+J,Ae/G.locationSize,rt,oe,Ae*at,Ae/G.locationSize*J*at,$)}}else if(V!==void 0){const oe=V[Y];if(oe!==void 0)switch(oe.length){case 2:s.vertexAttrib2fv(G.location,oe);break;case 3:s.vertexAttrib3fv(G.location,oe);break;case 4:s.vertexAttrib4fv(G.location,oe);break;default:s.vertexAttrib1fv(G.location,oe)}}}}_()}function T(){L();for(const M in n){const C=n[M];for(const D in C){const F=C[D];for(const k in F)h(F[k].object),delete F[k];delete C[D]}delete n[M]}}function S(M){if(n[M.id]===void 0)return;const C=n[M.id];for(const D in C){const F=C[D];for(const k in F)h(F[k].object),delete F[k];delete C[D]}delete n[M.id]}function w(M){for(const C in n){const D=n[C];if(D[M.id]===void 0)continue;const F=D[M.id];for(const k in F)h(F[k].object),delete F[k];delete D[M.id]}}function L(){b(),o=!0,r!==i&&(r=i,l(r.object))}function b(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:a,reset:L,resetDefaultState:b,dispose:T,releaseStatesOfGeometry:S,releaseStatesOfProgram:w,initAttributes:y,enableAttribute:g,disableUnusedAttributes:_}}function Rx(s,e,t){let n;function i(l){n=l}function r(l,h){s.drawArrays(n,l,h),t.update(h,n,1)}function o(l,h,u){u!==0&&(s.drawArraysInstanced(n,l,h,u),t.update(h,n,u))}function a(l,h,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,h,0,u);let d=0;for(let x=0;x<u;x++)d+=h[x];t.update(d,n,1)}function c(l,h,u,f){if(u===0)return;const d=e.get("WEBGL_multi_draw");if(d===null)for(let x=0;x<l.length;x++)o(l[x],h[x],f[x]);else{d.multiDrawArraysInstancedWEBGL(n,l,0,h,0,f,0,u);let x=0;for(let y=0;y<u;y++)x+=h[y]*f[y];t.update(x,n,1)}}this.setMode=i,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=c}function Cx(s,e,t,n){let i;function r(){if(i!==void 0)return i;if(e.has("EXT_texture_filter_anisotropic")===!0){const w=e.get("EXT_texture_filter_anisotropic");i=s.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(w){return!(w!==an&&n.convert(w)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(w){const L=w===ts&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(w!==Tn&&n.convert(w)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE)&&w!==mn&&!L)}function c(w){if(w==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";w="mediump"}return w==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=t.precision!==void 0?t.precision:"highp";const h=c(l);h!==l&&(Pe("WebGLRenderer:",l,"not supported, using",h,"instead."),l=h);const u=t.logarithmicDepthBuffer===!0,f=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),d=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),x=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),y=s.getParameter(s.MAX_TEXTURE_SIZE),g=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),m=s.getParameter(s.MAX_VERTEX_ATTRIBS),_=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),p=s.getParameter(s.MAX_VARYING_VECTORS),v=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),T=x>0,S=s.getParameter(s.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:a,precision:l,logarithmicDepthBuffer:u,reversedDepthBuffer:f,maxTextures:d,maxVertexTextures:x,maxTextureSize:y,maxCubemapSize:g,maxAttributes:m,maxVertexUniforms:_,maxVaryings:p,maxFragmentUniforms:v,vertexTextures:T,maxSamples:S}}function Px(s){const e=this;let t=null,n=0,i=!1,r=!1;const o=new di,a=new Xe,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(u,f){const d=u.length!==0||f||n!==0||i;return i=f,n=u.length,d},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,f){t=h(u,f,0)},this.setState=function(u,f,d){const x=u.clippingPlanes,y=u.clipIntersection,g=u.clipShadows,m=s.get(u);if(!i||x===null||x.length===0||r&&!g)r?h(null):l();else{const _=r?0:n,p=_*4;let v=m.clippingState||null;c.value=v,v=h(x,f,p,d);for(let T=0;T!==p;++T)v[T]=t[T];m.clippingState=v,this.numIntersection=y?this.numPlanes:0,this.numPlanes+=_}};function l(){c.value!==t&&(c.value=t,c.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(u,f,d,x){const y=u!==null?u.length:0;let g=null;if(y!==0){if(g=c.value,x!==!0||g===null){const m=d+y*4,_=f.matrixWorldInverse;a.getNormalMatrix(_),(g===null||g.length<m)&&(g=new Float32Array(m));for(let p=0,v=d;p!==y;++p,v+=4)o.copy(u[p]).applyMatrix4(_,a),o.normal.toArray(g,v),g[v+3]=o.constant}c.value=g,c.needsUpdate=!0}return e.numPlanes=y,e.numIntersection=0,g}}function Lx(s){let e=new WeakMap;function t(o,a){return a===Qo?o.mapping=Xi:a===ea&&(o.mapping=qi),o}function n(o){if(o&&o.isTexture){const a=o.mapping;if(a===Qo||a===ea)if(e.has(o)){const c=e.get(o).texture;return t(c,o.mapping)}else{const c=o.image;if(c&&c.height>0){const l=new vf(c.height);return l.fromEquirectangularTexture(s,o),e.set(o,l),o.addEventListener("dispose",i),t(l.texture,o.mapping)}else return null}}return o}function i(o){const a=o.target;a.removeEventListener("dispose",i);const c=e.get(a);c!==void 0&&(e.delete(a),c.dispose())}function r(){e=new WeakMap}return{get:n,dispose:r}}const ei=4,Tl=[.125,.215,.35,.446,.526,.582],pi=20,Ix=256,ys=new cc,El=new Ve;let Do=null,No=0,Uo=0,Fo=!1;const Dx=new I;class Al{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._sigmas=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,i=100,r={}){const{size:o=256,position:a=Dx}=r;Do=this._renderer.getRenderTarget(),No=this._renderer.getActiveCubeFace(),Uo=this._renderer.getActiveMipmapLevel(),Fo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);const c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(e,n,i,c,a),t>0&&this._blur(c,0,0,t),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Cl(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Rl(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Do,No,Uo),this._renderer.xr.enabled=Fo,e.scissorTest=!1,Bi(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Xi||e.mapping===qi?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Do=this._renderer.getRenderTarget(),No=this._renderer.getActiveCubeFace(),Uo=this._renderer.getActiveMipmapLevel(),Fo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:zt,minFilter:zt,generateMipmaps:!1,type:ts,format:an,colorSpace:Gt,depthBuffer:!1},i=wl(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=wl(e,t,n);const{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods,sigmas:this._sigmas}=Nx(r)),this._blurMaterial=Fx(r,e,t),this._ggxMaterial=Ux(r,e,t)}return i}_compileMaterial(e){const t=new Ze(new _t,e);this._renderer.compile(t,ys)}_sceneToCubeUV(e,t,n,i,r){const c=new Xt(90,1,t,n),l=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],u=this._renderer,f=u.autoClear,d=u.toneMapping;u.getClearColor(El),u.toneMapping=ti,u.autoClear=!1,u.state.buffers.depth.getReversed()&&(u.setRenderTarget(i),u.clearDepth(),u.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new Ze(new Yt,new Tt({name:"PMREM.Background",side:qt,depthWrite:!1,depthTest:!1})));const y=this._backgroundBox,g=y.material;let m=!1;const _=e.background;_?_.isColor&&(g.color.copy(_),e.background=null,m=!0):(g.color.copy(El),m=!0);for(let p=0;p<6;p++){const v=p%3;v===0?(c.up.set(0,l[p],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x+h[p],r.y,r.z)):v===1?(c.up.set(0,0,l[p]),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y+h[p],r.z)):(c.up.set(0,l[p],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y,r.z+h[p]));const T=this._cubeSize;Bi(i,v*T,p>2?T:0,T,T),u.setRenderTarget(i),m&&u.render(y,c),u.render(e,c)}u.toneMapping=d,u.autoClear=f,e.background=_}_textureToCubeUV(e,t){const n=this._renderer,i=e.mapping===Xi||e.mapping===qi;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=Cl()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Rl());const r=i?this._cubemapMaterial:this._equirectMaterial,o=this._lodMeshes[0];o.material=r;const a=r.uniforms;a.envMap.value=e;const c=this._cubeSize;Bi(t,0,0,3*c,2*c),n.setRenderTarget(t),n.render(o,ys)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const i=this._lodMeshes.length;for(let r=1;r<i;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=n}_applyGGXFilter(e,t,n){const i=this._renderer,r=this._pingPongRenderTarget,o=this._ggxMaterial,a=this._lodMeshes[n];a.material=o;const c=o.uniforms,l=n/(this._lodMeshes.length-1),h=t/(this._lodMeshes.length-1),u=Math.sqrt(l*l-h*h),f=.05+l*.95,d=u*f,{_lodMax:x}=this,y=this._sizeLods[n],g=3*y*(n>x-ei?n-x+ei:0),m=4*(this._cubeSize-y);c.envMap.value=e.texture,c.roughness.value=d,c.mipInt.value=x-t,Bi(r,g,m,3*y,2*y),i.setRenderTarget(r),i.render(a,ys),c.envMap.value=r.texture,c.roughness.value=0,c.mipInt.value=x-n,Bi(e,g,m,3*y,2*y),i.setRenderTarget(e),i.render(a,ys)}_blur(e,t,n,i,r){const o=this._pingPongRenderTarget;this._halfBlur(e,o,t,n,i,"latitudinal",r),this._halfBlur(o,e,n,n,i,"longitudinal",r)}_halfBlur(e,t,n,i,r,o,a){const c=this._renderer,l=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&$e("blur direction must be either latitudinal or longitudinal!");const h=3,u=this._lodMeshes[i];u.material=l;const f=l.uniforms,d=this._sizeLods[n]-1,x=isFinite(r)?Math.PI/(2*d):2*Math.PI/(2*pi-1),y=r/x,g=isFinite(r)?1+Math.floor(h*y):pi;g>pi&&Pe(`sigmaRadians, ${r}, is too large and will clip, as it requested ${g} samples when the maximum is set to ${pi}`);const m=[];let _=0;for(let w=0;w<pi;++w){const L=w/y,b=Math.exp(-L*L/2);m.push(b),w===0?_+=b:w<g&&(_+=2*b)}for(let w=0;w<m.length;w++)m[w]=m[w]/_;f.envMap.value=e.texture,f.samples.value=g,f.weights.value=m,f.latitudinal.value=o==="latitudinal",a&&(f.poleAxis.value=a);const{_lodMax:p}=this;f.dTheta.value=x,f.mipInt.value=p-n;const v=this._sizeLods[i],T=3*v*(i>p-ei?i-p+ei:0),S=4*(this._cubeSize-v);Bi(t,T,S,3*v,2*v),c.setRenderTarget(t),c.render(u,ys)}}function Nx(s){const e=[],t=[],n=[];let i=s;const r=s-ei+1+Tl.length;for(let o=0;o<r;o++){const a=Math.pow(2,i);e.push(a);let c=1/a;o>s-ei?c=Tl[o-s+ei-1]:o===0&&(c=0),t.push(c);const l=1/(a-2),h=-l,u=1+l,f=[h,h,u,h,u,u,h,h,u,u,h,u],d=6,x=6,y=3,g=2,m=1,_=new Float32Array(y*x*d),p=new Float32Array(g*x*d),v=new Float32Array(m*x*d);for(let S=0;S<d;S++){const w=S%3*2/3-1,L=S>2?0:-1,b=[w,L,0,w+2/3,L,0,w+2/3,L+1,0,w,L,0,w+2/3,L+1,0,w,L+1,0];_.set(b,y*x*S),p.set(f,g*x*S);const M=[S,S,S,S,S,S];v.set(M,m*x*S)}const T=new _t;T.setAttribute("position",new Ut(_,y)),T.setAttribute("uv",new Ut(p,g)),T.setAttribute("faceIndex",new Ut(v,m)),n.push(new Ze(T,null)),i>ei&&i--}return{lodMeshes:n,sizeLods:e,sigmas:t}}function wl(s,e,t){const n=new xi(s,e,t);return n.texture.mapping=Wr,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Bi(s,e,t,n,i){s.viewport.set(e,t,n,i),s.scissor.set(e,t,n,i)}function Ux(s,e,t){return new Hn({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:Ix,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Kr(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 3.2: Transform view direction to hemisphere configuration
				vec3 Vh = normalize(vec3(alpha * V.x, alpha * V.y, V.z));

				// Section 4.1: Orthonormal basis
				float lensq = Vh.x * Vh.x + Vh.y * Vh.y;
				vec3 T1 = lensq > 0.0 ? vec3(-Vh.y, Vh.x, 0.0) / sqrt(lensq) : vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(Vh, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + Vh.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * Vh;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:kn,depthTest:!1,depthWrite:!1})}function Fx(s,e,t){const n=new Float32Array(pi),i=new I(0,1,0);return new Hn({name:"SphericalGaussianBlur",defines:{n:pi,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:Kr(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:kn,depthTest:!1,depthWrite:!1})}function Rl(){return new Hn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Kr(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:kn,depthTest:!1,depthWrite:!1})}function Cl(){return new Hn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Kr(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:kn,depthTest:!1,depthWrite:!1})}function Kr(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function Ox(s){let e=new WeakMap,t=null;function n(a){if(a&&a.isTexture){const c=a.mapping,l=c===Qo||c===ea,h=c===Xi||c===qi;if(l||h){let u=e.get(a);const f=u!==void 0?u.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==f)return t===null&&(t=new Al(s)),u=l?t.fromEquirectangular(a,u):t.fromCubemap(a,u),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),u.texture;if(u!==void 0)return u.texture;{const d=a.image;return l&&d&&d.height>0||h&&d&&i(d)?(t===null&&(t=new Al(s)),u=l?t.fromEquirectangular(a):t.fromCubemap(a),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),a.addEventListener("dispose",r),u.texture):null}}}return a}function i(a){let c=0;const l=6;for(let h=0;h<l;h++)a[h]!==void 0&&c++;return c===l}function r(a){const c=a.target;c.removeEventListener("dispose",r);const l=e.get(c);l!==void 0&&(e.delete(c),l.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:o}}function Bx(s){const e={};function t(n){if(e[n]!==void 0)return e[n];const i=s.getExtension(n);return e[n]=i,i}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const i=t(n);return i===null&&Vs("WebGLRenderer: "+n+" extension not supported."),i}}}function zx(s,e,t,n){const i={},r=new WeakMap;function o(u){const f=u.target;f.index!==null&&e.remove(f.index);for(const x in f.attributes)e.remove(f.attributes[x]);f.removeEventListener("dispose",o),delete i[f.id];const d=r.get(f);d&&(e.remove(d),r.delete(f)),n.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,t.memory.geometries--}function a(u,f){return i[f.id]===!0||(f.addEventListener("dispose",o),i[f.id]=!0,t.memory.geometries++),f}function c(u){const f=u.attributes;for(const d in f)e.update(f[d],s.ARRAY_BUFFER)}function l(u){const f=[],d=u.index,x=u.attributes.position;let y=0;if(d!==null){const _=d.array;y=d.version;for(let p=0,v=_.length;p<v;p+=3){const T=_[p+0],S=_[p+1],w=_[p+2];f.push(T,S,S,w,w,T)}}else if(x!==void 0){const _=x.array;y=x.version;for(let p=0,v=_.length/3-1;p<v;p+=3){const T=p+0,S=p+1,w=p+2;f.push(T,S,S,w,w,T)}}else return;const g=new(Sh(f)?wh:Ah)(f,1);g.version=y;const m=r.get(u);m&&e.remove(m),r.set(u,g)}function h(u){const f=r.get(u);if(f){const d=u.index;d!==null&&f.version<d.version&&l(u)}else l(u);return r.get(u)}return{get:a,update:c,getWireframeAttribute:h}}function kx(s,e,t){let n;function i(f){n=f}let r,o;function a(f){r=f.type,o=f.bytesPerElement}function c(f,d){s.drawElements(n,d,r,f*o),t.update(d,n,1)}function l(f,d,x){x!==0&&(s.drawElementsInstanced(n,d,r,f*o,x),t.update(d,n,x))}function h(f,d,x){if(x===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,d,0,r,f,0,x);let g=0;for(let m=0;m<x;m++)g+=d[m];t.update(g,n,1)}function u(f,d,x,y){if(x===0)return;const g=e.get("WEBGL_multi_draw");if(g===null)for(let m=0;m<f.length;m++)l(f[m]/o,d[m],y[m]);else{g.multiDrawElementsInstancedWEBGL(n,d,0,r,f,0,y,0,x);let m=0;for(let _=0;_<x;_++)m+=d[_]*y[_];t.update(m,n,1)}}this.setMode=i,this.setIndex=a,this.render=c,this.renderInstances=l,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function Vx(s){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(t.calls++,o){case s.TRIANGLES:t.triangles+=a*(r/3);break;case s.LINES:t.lines+=a*(r/2);break;case s.LINE_STRIP:t.lines+=a*(r-1);break;case s.LINE_LOOP:t.lines+=a*r;break;case s.POINTS:t.points+=a*r;break;default:$e("WebGLInfo: Unknown draw mode:",o);break}}function i(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:i,update:n}}function Gx(s,e,t){const n=new WeakMap,i=new ot;function r(o,a,c){const l=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=h!==void 0?h.length:0;let f=n.get(a);if(f===void 0||f.count!==u){let b=function(){w.dispose(),n.delete(a),a.removeEventListener("dispose",b)};f!==void 0&&f.texture.dispose();const d=a.morphAttributes.position!==void 0,x=a.morphAttributes.normal!==void 0,y=a.morphAttributes.color!==void 0,g=a.morphAttributes.position||[],m=a.morphAttributes.normal||[],_=a.morphAttributes.color||[];let p=0;d===!0&&(p=1),x===!0&&(p=2),y===!0&&(p=3);let v=a.attributes.position.count*p,T=1;v>e.maxTextureSize&&(T=Math.ceil(v/e.maxTextureSize),v=e.maxTextureSize);const S=new Float32Array(v*T*4*u),w=new Th(S,v,T,u);w.type=mn,w.needsUpdate=!0;const L=p*4;for(let M=0;M<u;M++){const C=g[M],D=m[M],F=_[M],k=v*T*4*M;for(let z=0;z<C.count;z++){const V=z*L;d===!0&&(i.fromBufferAttribute(C,z),S[k+V+0]=i.x,S[k+V+1]=i.y,S[k+V+2]=i.z,S[k+V+3]=0),x===!0&&(i.fromBufferAttribute(D,z),S[k+V+4]=i.x,S[k+V+5]=i.y,S[k+V+6]=i.z,S[k+V+7]=0),y===!0&&(i.fromBufferAttribute(F,z),S[k+V+8]=i.x,S[k+V+9]=i.y,S[k+V+10]=i.z,S[k+V+11]=F.itemSize===4?i.w:1)}}f={count:u,texture:w,size:new te(v,T)},n.set(a,f),a.addEventListener("dispose",b)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)c.getUniforms().setValue(s,"morphTexture",o.morphTexture,t);else{let d=0;for(let y=0;y<l.length;y++)d+=l[y];const x=a.morphTargetsRelative?1:1-d;c.getUniforms().setValue(s,"morphTargetBaseInfluence",x),c.getUniforms().setValue(s,"morphTargetInfluences",l)}c.getUniforms().setValue(s,"morphTargetsTexture",f.texture,t),c.getUniforms().setValue(s,"morphTargetsTextureSize",f.size)}return{update:r}}function Hx(s,e,t,n){let i=new WeakMap;function r(c){const l=n.render.frame,h=c.geometry,u=e.get(c,h);if(i.get(u)!==l&&(e.update(u),i.set(u,l)),c.isInstancedMesh&&(c.hasEventListener("dispose",a)===!1&&c.addEventListener("dispose",a),i.get(c)!==l&&(t.update(c.instanceMatrix,s.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,s.ARRAY_BUFFER),i.set(c,l))),c.isSkinnedMesh){const f=c.skeleton;i.get(f)!==l&&(f.update(),i.set(f,l))}return u}function o(){i=new WeakMap}function a(c){const l=c.target;l.removeEventListener("dispose",a),t.remove(l.instanceMatrix),l.instanceColor!==null&&t.remove(l.instanceColor)}return{update:r,dispose:o}}const ou=new Rt,Pl=new Bh(1,1),au=new Th,cu=new tf,lu=new Ph,Ll=[],Il=[],Dl=new Float32Array(16),Nl=new Float32Array(9),Ul=new Float32Array(4);function os(s,e,t){const n=s[0];if(n<=0||n>0)return s;const i=e*t;let r=Ll[i];if(r===void 0&&(r=new Float32Array(i),Ll[i]=r),e!==0){n.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,s[o].toArray(r,a)}return r}function Ct(s,e){if(s.length!==e.length)return!1;for(let t=0,n=s.length;t<n;t++)if(s[t]!==e[t])return!1;return!0}function Pt(s,e){for(let t=0,n=e.length;t<n;t++)s[t]=e[t]}function jr(s,e){let t=Il[e];t===void 0&&(t=new Int32Array(e),Il[e]=t);for(let n=0;n!==e;++n)t[n]=s.allocateTextureUnit();return t}function Wx(s,e){const t=this.cache;t[0]!==e&&(s.uniform1f(this.addr,e),t[0]=e)}function Xx(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ct(t,e))return;s.uniform2fv(this.addr,e),Pt(t,e)}}function qx(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(s.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Ct(t,e))return;s.uniform3fv(this.addr,e),Pt(t,e)}}function Yx(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ct(t,e))return;s.uniform4fv(this.addr,e),Pt(t,e)}}function $x(s,e){const t=this.cache,n=e.elements;if(n===void 0){if(Ct(t,e))return;s.uniformMatrix2fv(this.addr,!1,e),Pt(t,e)}else{if(Ct(t,n))return;Ul.set(n),s.uniformMatrix2fv(this.addr,!1,Ul),Pt(t,n)}}function Kx(s,e){const t=this.cache,n=e.elements;if(n===void 0){if(Ct(t,e))return;s.uniformMatrix3fv(this.addr,!1,e),Pt(t,e)}else{if(Ct(t,n))return;Nl.set(n),s.uniformMatrix3fv(this.addr,!1,Nl),Pt(t,n)}}function jx(s,e){const t=this.cache,n=e.elements;if(n===void 0){if(Ct(t,e))return;s.uniformMatrix4fv(this.addr,!1,e),Pt(t,e)}else{if(Ct(t,n))return;Dl.set(n),s.uniformMatrix4fv(this.addr,!1,Dl),Pt(t,n)}}function Jx(s,e){const t=this.cache;t[0]!==e&&(s.uniform1i(this.addr,e),t[0]=e)}function Zx(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ct(t,e))return;s.uniform2iv(this.addr,e),Pt(t,e)}}function Qx(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Ct(t,e))return;s.uniform3iv(this.addr,e),Pt(t,e)}}function eg(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ct(t,e))return;s.uniform4iv(this.addr,e),Pt(t,e)}}function tg(s,e){const t=this.cache;t[0]!==e&&(s.uniform1ui(this.addr,e),t[0]=e)}function ng(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ct(t,e))return;s.uniform2uiv(this.addr,e),Pt(t,e)}}function ig(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Ct(t,e))return;s.uniform3uiv(this.addr,e),Pt(t,e)}}function sg(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ct(t,e))return;s.uniform4uiv(this.addr,e),Pt(t,e)}}function rg(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i);let r;this.type===s.SAMPLER_2D_SHADOW?(Pl.compareFunction=bh,r=Pl):r=ou,t.setTexture2D(e||r,i)}function og(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTexture3D(e||cu,i)}function ag(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTextureCube(e||lu,i)}function cg(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTexture2DArray(e||au,i)}function lg(s){switch(s){case 5126:return Wx;case 35664:return Xx;case 35665:return qx;case 35666:return Yx;case 35674:return $x;case 35675:return Kx;case 35676:return jx;case 5124:case 35670:return Jx;case 35667:case 35671:return Zx;case 35668:case 35672:return Qx;case 35669:case 35673:return eg;case 5125:return tg;case 36294:return ng;case 36295:return ig;case 36296:return sg;case 35678:case 36198:case 36298:case 36306:case 35682:return rg;case 35679:case 36299:case 36307:return og;case 35680:case 36300:case 36308:case 36293:return ag;case 36289:case 36303:case 36311:case 36292:return cg}}function hg(s,e){s.uniform1fv(this.addr,e)}function ug(s,e){const t=os(e,this.size,2);s.uniform2fv(this.addr,t)}function dg(s,e){const t=os(e,this.size,3);s.uniform3fv(this.addr,t)}function fg(s,e){const t=os(e,this.size,4);s.uniform4fv(this.addr,t)}function pg(s,e){const t=os(e,this.size,4);s.uniformMatrix2fv(this.addr,!1,t)}function mg(s,e){const t=os(e,this.size,9);s.uniformMatrix3fv(this.addr,!1,t)}function xg(s,e){const t=os(e,this.size,16);s.uniformMatrix4fv(this.addr,!1,t)}function gg(s,e){s.uniform1iv(this.addr,e)}function _g(s,e){s.uniform2iv(this.addr,e)}function vg(s,e){s.uniform3iv(this.addr,e)}function yg(s,e){s.uniform4iv(this.addr,e)}function Mg(s,e){s.uniform1uiv(this.addr,e)}function bg(s,e){s.uniform2uiv(this.addr,e)}function Sg(s,e){s.uniform3uiv(this.addr,e)}function Tg(s,e){s.uniform4uiv(this.addr,e)}function Eg(s,e,t){const n=this.cache,i=e.length,r=jr(t,i);Ct(n,r)||(s.uniform1iv(this.addr,r),Pt(n,r));for(let o=0;o!==i;++o)t.setTexture2D(e[o]||ou,r[o])}function Ag(s,e,t){const n=this.cache,i=e.length,r=jr(t,i);Ct(n,r)||(s.uniform1iv(this.addr,r),Pt(n,r));for(let o=0;o!==i;++o)t.setTexture3D(e[o]||cu,r[o])}function wg(s,e,t){const n=this.cache,i=e.length,r=jr(t,i);Ct(n,r)||(s.uniform1iv(this.addr,r),Pt(n,r));for(let o=0;o!==i;++o)t.setTextureCube(e[o]||lu,r[o])}function Rg(s,e,t){const n=this.cache,i=e.length,r=jr(t,i);Ct(n,r)||(s.uniform1iv(this.addr,r),Pt(n,r));for(let o=0;o!==i;++o)t.setTexture2DArray(e[o]||au,r[o])}function Cg(s){switch(s){case 5126:return hg;case 35664:return ug;case 35665:return dg;case 35666:return fg;case 35674:return pg;case 35675:return mg;case 35676:return xg;case 5124:case 35670:return gg;case 35667:case 35671:return _g;case 35668:case 35672:return vg;case 35669:case 35673:return yg;case 5125:return Mg;case 36294:return bg;case 36295:return Sg;case 36296:return Tg;case 35678:case 36198:case 36298:case 36306:case 35682:return Eg;case 35679:case 36299:case 36307:return Ag;case 35680:case 36300:case 36308:case 36293:return wg;case 36289:case 36303:case 36311:case 36292:return Rg}}class Pg{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=lg(t.type)}}class Lg{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Cg(t.type)}}class Ig{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const i=this.seq;for(let r=0,o=i.length;r!==o;++r){const a=i[r];a.setValue(e,t[a.id],n)}}}const Oo=/(\w+)(\])?(\[|\.)?/g;function Fl(s,e){s.seq.push(e),s.map[e.id]=e}function Dg(s,e,t){const n=s.name,i=n.length;for(Oo.lastIndex=0;;){const r=Oo.exec(n),o=Oo.lastIndex;let a=r[1];const c=r[2]==="]",l=r[3];if(c&&(a=a|0),l===void 0||l==="["&&o+2===i){Fl(t,l===void 0?new Pg(a,s,e):new Lg(a,s,e));break}else{let u=t.map[a];u===void 0&&(u=new Ig(a),Fl(t,u)),t=u}}}class Ur{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let i=0;i<n;++i){const r=e.getActiveUniform(t,i),o=e.getUniformLocation(t,r.name);Dg(r,o,this)}}setValue(e,t,n,i){const r=this.map[t];r!==void 0&&r.setValue(e,n,i)}setOptional(e,t,n){const i=t[n];i!==void 0&&this.setValue(e,n,i)}static upload(e,t,n,i){for(let r=0,o=t.length;r!==o;++r){const a=t[r],c=n[a.id];c.needsUpdate!==!1&&a.setValue(e,c.value,i)}}static seqWithValue(e,t){const n=[];for(let i=0,r=e.length;i!==r;++i){const o=e[i];o.id in t&&n.push(o)}return n}}function Ol(s,e,t){const n=s.createShader(e);return s.shaderSource(n,t),s.compileShader(n),n}const Ng=37297;let Ug=0;function Fg(s,e){const t=s.split(`
`),n=[],i=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=i;o<r;o++){const a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}const Bl=new Xe;function Og(s){nt._getMatrix(Bl,nt.workingColorSpace,s);const e=`mat3( ${Bl.elements.map(t=>t.toFixed(4))} )`;switch(nt.getTransfer(s)){case Or:return[e,"LinearTransferOETF"];case dt:return[e,"sRGBTransferOETF"];default:return Pe("WebGLProgram: Unsupported color space: ",s),[e,"LinearTransferOETF"]}}function zl(s,e,t){const n=s.getShaderParameter(e,s.COMPILE_STATUS),r=(s.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";const o=/ERROR: 0:(\d+)/.exec(r);if(o){const a=parseInt(o[1]);return t.toUpperCase()+`

`+r+`

`+Fg(s.getShaderSource(e),a)}else return r}function Bg(s,e){const t=Og(e);return[`vec4 ${s}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function zg(s,e){let t;switch(e){case ud:t="Linear";break;case dd:t="Reinhard";break;case fd:t="Cineon";break;case pd:t="ACESFilmic";break;case xd:t="AgX";break;case gd:t="Neutral";break;case md:t="Custom";break;default:Pe("WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+s+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const wr=new I;function kg(){nt.getLuminanceCoefficients(wr);const s=wr.x.toFixed(4),e=wr.y.toFixed(4),t=wr.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Vg(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Es).join(`
`)}function Gg(s){const e=[];for(const t in s){const n=s[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function Hg(s,e){const t={},n=s.getProgramParameter(e,s.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){const r=s.getActiveAttrib(e,i),o=r.name;let a=1;r.type===s.FLOAT_MAT2&&(a=2),r.type===s.FLOAT_MAT3&&(a=3),r.type===s.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:s.getAttribLocation(e,o),locationSize:a}}return t}function Es(s){return s!==""}function kl(s,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return s.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Vl(s,e){return s.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const Wg=/^[ \t]*#include +<([\w\d./]+)>/gm;function Fa(s){return s.replace(Wg,qg)}const Xg=new Map;function qg(s,e){let t=Ye[e];if(t===void 0){const n=Xg.get(e);if(n!==void 0)t=Ye[n],Pe('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return Fa(t)}const Yg=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Gl(s){return s.replace(Yg,$g)}function $g(s,e,t,n){let i="";for(let r=parseInt(e);r<parseInt(t);r++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return i}function Hl(s){let e=`precision ${s.precision} float;
	precision ${s.precision} int;
	precision ${s.precision} sampler2D;
	precision ${s.precision} samplerCube;
	precision ${s.precision} sampler3D;
	precision ${s.precision} sampler2DArray;
	precision ${s.precision} sampler2DShadow;
	precision ${s.precision} samplerCubeShadow;
	precision ${s.precision} sampler2DArrayShadow;
	precision ${s.precision} isampler2D;
	precision ${s.precision} isampler3D;
	precision ${s.precision} isamplerCube;
	precision ${s.precision} isampler2DArray;
	precision ${s.precision} usampler2D;
	precision ${s.precision} usampler3D;
	precision ${s.precision} usamplerCube;
	precision ${s.precision} usampler2DArray;
	`;return s.precision==="highp"?e+=`
#define HIGH_PRECISION`:s.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:s.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function Kg(s){let e="SHADOWMAP_TYPE_BASIC";return s.shadowMapType===hh?e="SHADOWMAP_TYPE_PCF":s.shadowMapType===Wu?e="SHADOWMAP_TYPE_PCF_SOFT":s.shadowMapType===Fn&&(e="SHADOWMAP_TYPE_VSM"),e}function jg(s){let e="ENVMAP_TYPE_CUBE";if(s.envMap)switch(s.envMapMode){case Xi:case qi:e="ENVMAP_TYPE_CUBE";break;case Wr:e="ENVMAP_TYPE_CUBE_UV";break}return e}function Jg(s){let e="ENVMAP_MODE_REFLECTION";return s.envMap&&s.envMapMode===qi&&(e="ENVMAP_MODE_REFRACTION"),e}function Zg(s){let e="ENVMAP_BLENDING_NONE";if(s.envMap)switch(s.combine){case uh:e="ENVMAP_BLENDING_MULTIPLY";break;case ld:e="ENVMAP_BLENDING_MIX";break;case hd:e="ENVMAP_BLENDING_ADD";break}return e}function Qg(s){const e=s.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function e_(s,e,t,n){const i=s.getContext(),r=t.defines;let o=t.vertexShader,a=t.fragmentShader;const c=Kg(t),l=jg(t),h=Jg(t),u=Zg(t),f=Qg(t),d=Vg(t),x=Gg(r),y=i.createProgram();let g,m,_=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x].filter(Es).join(`
`),g.length>0&&(g+=`
`),m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x].filter(Es).join(`
`),m.length>0&&(m+=`
`)):(g=[Hl(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Es).join(`
`),m=[Hl(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==ti?"#define TONE_MAPPING":"",t.toneMapping!==ti?Ye.tonemapping_pars_fragment:"",t.toneMapping!==ti?zg("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Ye.colorspace_pars_fragment,Bg("linearToOutputTexel",t.outputColorSpace),kg(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Es).join(`
`)),o=Fa(o),o=kl(o,t),o=Vl(o,t),a=Fa(a),a=kl(a,t),a=Vl(a,t),o=Gl(o),a=Gl(a),t.isRawShaderMaterial!==!0&&(_=`#version 300 es
`,g=[d,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,m=["#define varying in",t.glslVersion===Lc?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Lc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+m);const p=_+g+o,v=_+m+a,T=Ol(i,i.VERTEX_SHADER,p),S=Ol(i,i.FRAGMENT_SHADER,v);i.attachShader(y,T),i.attachShader(y,S),t.index0AttributeName!==void 0?i.bindAttribLocation(y,0,t.index0AttributeName):t.morphTargets===!0&&i.bindAttribLocation(y,0,"position"),i.linkProgram(y);function w(C){if(s.debug.checkShaderErrors){const D=i.getProgramInfoLog(y)||"",F=i.getShaderInfoLog(T)||"",k=i.getShaderInfoLog(S)||"",z=D.trim(),V=F.trim(),Y=k.trim();let G=!0,ne=!0;if(i.getProgramParameter(y,i.LINK_STATUS)===!1)if(G=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(i,y,T,S);else{const oe=zl(i,T,"vertex"),Ae=zl(i,S,"fragment");$e("THREE.WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(y,i.VALIDATE_STATUS)+`

Material Name: `+C.name+`
Material Type: `+C.type+`

Program Info Log: `+z+`
`+oe+`
`+Ae)}else z!==""?Pe("WebGLProgram: Program Info Log:",z):(V===""||Y==="")&&(ne=!1);ne&&(C.diagnostics={runnable:G,programLog:z,vertexShader:{log:V,prefix:g},fragmentShader:{log:Y,prefix:m}})}i.deleteShader(T),i.deleteShader(S),L=new Ur(i,y),b=Hg(i,y)}let L;this.getUniforms=function(){return L===void 0&&w(this),L};let b;this.getAttributes=function(){return b===void 0&&w(this),b};let M=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return M===!1&&(M=i.getProgramParameter(y,Ng)),M},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(y),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Ug++,this.cacheKey=e,this.usedTimes=1,this.program=y,this.vertexShader=T,this.fragmentShader=S,this}let t_=0;class n_{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,i=this._getShaderStage(t),r=this._getShaderStage(n),o=this._getShaderCacheForMaterial(e);return o.has(i)===!1&&(o.add(i),i.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new i_(e),t.set(e,n)),n}}class i_{constructor(e){this.id=t_++,this.code=e,this.usedTimes=0}}function s_(s,e,t,n,i,r,o){const a=new Za,c=new n_,l=new Set,h=[],u=i.logarithmicDepthBuffer,f=i.vertexTextures;let d=i.precision;const x={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function y(b){return l.add(b),b===0?"uv":`uv${b}`}function g(b,M,C,D,F){const k=D.fog,z=F.geometry,V=b.isMeshStandardMaterial?D.environment:null,Y=(b.isMeshStandardMaterial?t:e).get(b.envMap||V),G=Y&&Y.mapping===Wr?Y.image.height:null,ne=x[b.type];b.precision!==null&&(d=i.getMaxPrecision(b.precision),d!==b.precision&&Pe("WebGLProgram.getParameters:",b.precision,"not supported, using",d,"instead."));const oe=z.morphAttributes.position||z.morphAttributes.normal||z.morphAttributes.color,Ae=oe!==void 0?oe.length:0;let je=0;z.morphAttributes.position!==void 0&&(je=1),z.morphAttributes.normal!==void 0&&(je=2),z.morphAttributes.color!==void 0&&(je=3);let et,rt,at,$;if(ne){const ht=yn[ne];et=ht.vertexShader,rt=ht.fragmentShader}else et=b.vertexShader,rt=b.fragmentShader,c.update(b),at=c.getVertexShaderID(b),$=c.getFragmentShaderID(b);const J=s.getRenderTarget(),ye=s.state.buffers.depth.getReversed(),De=F.isInstancedMesh===!0,Re=F.isBatchedMesh===!0,Je=!!b.map,pt=!!b.matcap,Be=!!Y,Q=!!b.aoMap,P=!!b.lightMap,Z=!!b.bumpMap,re=!!b.normalMap,ce=!!b.displacementMap,ie=!!b.emissiveMap,be=!!b.metalnessMap,de=!!b.roughnessMap,ve=b.anisotropy>0,R=b.clearcoat>0,E=b.dispersion>0,B=b.iridescence>0,q=b.sheen>0,j=b.transmission>0,X=ve&&!!b.anisotropyMap,Ce=R&&!!b.clearcoatMap,fe=R&&!!b.clearcoatNormalMap,Le=R&&!!b.clearcoatRoughnessMap,we=B&&!!b.iridescenceMap,ee=B&&!!b.iridescenceThicknessMap,le=q&&!!b.sheenColorMap,Oe=q&&!!b.sheenRoughnessMap,Ue=!!b.specularMap,ge=!!b.specularColorMap,ke=!!b.specularIntensityMap,N=j&&!!b.transmissionMap,me=j&&!!b.thicknessMap,he=!!b.gradientMap,ue=!!b.alphaMap,se=b.alphaTest>0,K=!!b.alphaHash,Te=!!b.extensions;let He=ti;b.toneMapped&&(J===null||J.isXRRenderTarget===!0)&&(He=s.toneMapping);const xt={shaderID:ne,shaderType:b.type,shaderName:b.name,vertexShader:et,fragmentShader:rt,defines:b.defines,customVertexShaderID:at,customFragmentShaderID:$,isRawShaderMaterial:b.isRawShaderMaterial===!0,glslVersion:b.glslVersion,precision:d,batching:Re,batchingColor:Re&&F._colorsTexture!==null,instancing:De,instancingColor:De&&F.instanceColor!==null,instancingMorph:De&&F.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:J===null?s.outputColorSpace:J.isXRRenderTarget===!0?J.texture.colorSpace:Gt,alphaToCoverage:!!b.alphaToCoverage,map:Je,matcap:pt,envMap:Be,envMapMode:Be&&Y.mapping,envMapCubeUVHeight:G,aoMap:Q,lightMap:P,bumpMap:Z,normalMap:re,displacementMap:f&&ce,emissiveMap:ie,normalMapObjectSpace:re&&b.normalMapType===Sd,normalMapTangentSpace:re&&b.normalMapType===Mh,metalnessMap:be,roughnessMap:de,anisotropy:ve,anisotropyMap:X,clearcoat:R,clearcoatMap:Ce,clearcoatNormalMap:fe,clearcoatRoughnessMap:Le,dispersion:E,iridescence:B,iridescenceMap:we,iridescenceThicknessMap:ee,sheen:q,sheenColorMap:le,sheenRoughnessMap:Oe,specularMap:Ue,specularColorMap:ge,specularIntensityMap:ke,transmission:j,transmissionMap:N,thicknessMap:me,gradientMap:he,opaque:b.transparent===!1&&b.blending===ki&&b.alphaToCoverage===!1,alphaMap:ue,alphaTest:se,alphaHash:K,combine:b.combine,mapUv:Je&&y(b.map.channel),aoMapUv:Q&&y(b.aoMap.channel),lightMapUv:P&&y(b.lightMap.channel),bumpMapUv:Z&&y(b.bumpMap.channel),normalMapUv:re&&y(b.normalMap.channel),displacementMapUv:ce&&y(b.displacementMap.channel),emissiveMapUv:ie&&y(b.emissiveMap.channel),metalnessMapUv:be&&y(b.metalnessMap.channel),roughnessMapUv:de&&y(b.roughnessMap.channel),anisotropyMapUv:X&&y(b.anisotropyMap.channel),clearcoatMapUv:Ce&&y(b.clearcoatMap.channel),clearcoatNormalMapUv:fe&&y(b.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Le&&y(b.clearcoatRoughnessMap.channel),iridescenceMapUv:we&&y(b.iridescenceMap.channel),iridescenceThicknessMapUv:ee&&y(b.iridescenceThicknessMap.channel),sheenColorMapUv:le&&y(b.sheenColorMap.channel),sheenRoughnessMapUv:Oe&&y(b.sheenRoughnessMap.channel),specularMapUv:Ue&&y(b.specularMap.channel),specularColorMapUv:ge&&y(b.specularColorMap.channel),specularIntensityMapUv:ke&&y(b.specularIntensityMap.channel),transmissionMapUv:N&&y(b.transmissionMap.channel),thicknessMapUv:me&&y(b.thicknessMap.channel),alphaMapUv:ue&&y(b.alphaMap.channel),vertexTangents:!!z.attributes.tangent&&(re||ve),vertexColors:b.vertexColors,vertexAlphas:b.vertexColors===!0&&!!z.attributes.color&&z.attributes.color.itemSize===4,pointsUvs:F.isPoints===!0&&!!z.attributes.uv&&(Je||ue),fog:!!k,useFog:b.fog===!0,fogExp2:!!k&&k.isFogExp2,flatShading:b.flatShading===!0&&b.wireframe===!1,sizeAttenuation:b.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:ye,skinning:F.isSkinnedMesh===!0,morphTargets:z.morphAttributes.position!==void 0,morphNormals:z.morphAttributes.normal!==void 0,morphColors:z.morphAttributes.color!==void 0,morphTargetsCount:Ae,morphTextureStride:je,numDirLights:M.directional.length,numPointLights:M.point.length,numSpotLights:M.spot.length,numSpotLightMaps:M.spotLightMap.length,numRectAreaLights:M.rectArea.length,numHemiLights:M.hemi.length,numDirLightShadows:M.directionalShadowMap.length,numPointLightShadows:M.pointShadowMap.length,numSpotLightShadows:M.spotShadowMap.length,numSpotLightShadowsWithMaps:M.numSpotLightShadowsWithMaps,numLightProbes:M.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:b.dithering,shadowMapEnabled:s.shadowMap.enabled&&C.length>0,shadowMapType:s.shadowMap.type,toneMapping:He,decodeVideoTexture:Je&&b.map.isVideoTexture===!0&&nt.getTransfer(b.map.colorSpace)===dt,decodeVideoTextureEmissive:ie&&b.emissiveMap.isVideoTexture===!0&&nt.getTransfer(b.emissiveMap.colorSpace)===dt,premultipliedAlpha:b.premultipliedAlpha,doubleSided:b.side===Et,flipSided:b.side===qt,useDepthPacking:b.depthPacking>=0,depthPacking:b.depthPacking||0,index0AttributeName:b.index0AttributeName,extensionClipCullDistance:Te&&b.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Te&&b.extensions.multiDraw===!0||Re)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:b.customProgramCacheKey()};return xt.vertexUv1s=l.has(1),xt.vertexUv2s=l.has(2),xt.vertexUv3s=l.has(3),l.clear(),xt}function m(b){const M=[];if(b.shaderID?M.push(b.shaderID):(M.push(b.customVertexShaderID),M.push(b.customFragmentShaderID)),b.defines!==void 0)for(const C in b.defines)M.push(C),M.push(b.defines[C]);return b.isRawShaderMaterial===!1&&(_(M,b),p(M,b),M.push(s.outputColorSpace)),M.push(b.customProgramCacheKey),M.join()}function _(b,M){b.push(M.precision),b.push(M.outputColorSpace),b.push(M.envMapMode),b.push(M.envMapCubeUVHeight),b.push(M.mapUv),b.push(M.alphaMapUv),b.push(M.lightMapUv),b.push(M.aoMapUv),b.push(M.bumpMapUv),b.push(M.normalMapUv),b.push(M.displacementMapUv),b.push(M.emissiveMapUv),b.push(M.metalnessMapUv),b.push(M.roughnessMapUv),b.push(M.anisotropyMapUv),b.push(M.clearcoatMapUv),b.push(M.clearcoatNormalMapUv),b.push(M.clearcoatRoughnessMapUv),b.push(M.iridescenceMapUv),b.push(M.iridescenceThicknessMapUv),b.push(M.sheenColorMapUv),b.push(M.sheenRoughnessMapUv),b.push(M.specularMapUv),b.push(M.specularColorMapUv),b.push(M.specularIntensityMapUv),b.push(M.transmissionMapUv),b.push(M.thicknessMapUv),b.push(M.combine),b.push(M.fogExp2),b.push(M.sizeAttenuation),b.push(M.morphTargetsCount),b.push(M.morphAttributeCount),b.push(M.numDirLights),b.push(M.numPointLights),b.push(M.numSpotLights),b.push(M.numSpotLightMaps),b.push(M.numHemiLights),b.push(M.numRectAreaLights),b.push(M.numDirLightShadows),b.push(M.numPointLightShadows),b.push(M.numSpotLightShadows),b.push(M.numSpotLightShadowsWithMaps),b.push(M.numLightProbes),b.push(M.shadowMapType),b.push(M.toneMapping),b.push(M.numClippingPlanes),b.push(M.numClipIntersection),b.push(M.depthPacking)}function p(b,M){a.disableAll(),M.supportsVertexTextures&&a.enable(0),M.instancing&&a.enable(1),M.instancingColor&&a.enable(2),M.instancingMorph&&a.enable(3),M.matcap&&a.enable(4),M.envMap&&a.enable(5),M.normalMapObjectSpace&&a.enable(6),M.normalMapTangentSpace&&a.enable(7),M.clearcoat&&a.enable(8),M.iridescence&&a.enable(9),M.alphaTest&&a.enable(10),M.vertexColors&&a.enable(11),M.vertexAlphas&&a.enable(12),M.vertexUv1s&&a.enable(13),M.vertexUv2s&&a.enable(14),M.vertexUv3s&&a.enable(15),M.vertexTangents&&a.enable(16),M.anisotropy&&a.enable(17),M.alphaHash&&a.enable(18),M.batching&&a.enable(19),M.dispersion&&a.enable(20),M.batchingColor&&a.enable(21),M.gradientMap&&a.enable(22),b.push(a.mask),a.disableAll(),M.fog&&a.enable(0),M.useFog&&a.enable(1),M.flatShading&&a.enable(2),M.logarithmicDepthBuffer&&a.enable(3),M.reversedDepthBuffer&&a.enable(4),M.skinning&&a.enable(5),M.morphTargets&&a.enable(6),M.morphNormals&&a.enable(7),M.morphColors&&a.enable(8),M.premultipliedAlpha&&a.enable(9),M.shadowMapEnabled&&a.enable(10),M.doubleSided&&a.enable(11),M.flipSided&&a.enable(12),M.useDepthPacking&&a.enable(13),M.dithering&&a.enable(14),M.transmission&&a.enable(15),M.sheen&&a.enable(16),M.opaque&&a.enable(17),M.pointsUvs&&a.enable(18),M.decodeVideoTexture&&a.enable(19),M.decodeVideoTextureEmissive&&a.enable(20),M.alphaToCoverage&&a.enable(21),b.push(a.mask)}function v(b){const M=x[b.type];let C;if(M){const D=yn[M];C=mf.clone(D.uniforms)}else C=b.uniforms;return C}function T(b,M){let C;for(let D=0,F=h.length;D<F;D++){const k=h[D];if(k.cacheKey===M){C=k,++C.usedTimes;break}}return C===void 0&&(C=new e_(s,M,b,r),h.push(C)),C}function S(b){if(--b.usedTimes===0){const M=h.indexOf(b);h[M]=h[h.length-1],h.pop(),b.destroy()}}function w(b){c.remove(b)}function L(){c.dispose()}return{getParameters:g,getProgramCacheKey:m,getUniforms:v,acquireProgram:T,releaseProgram:S,releaseShaderCache:w,programs:h,dispose:L}}function r_(){let s=new WeakMap;function e(o){return s.has(o)}function t(o){let a=s.get(o);return a===void 0&&(a={},s.set(o,a)),a}function n(o){s.delete(o)}function i(o,a,c){s.get(o)[a]=c}function r(){s=new WeakMap}return{has:e,get:t,remove:n,update:i,dispose:r}}function o_(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.material.id!==e.material.id?s.material.id-e.material.id:s.z!==e.z?s.z-e.z:s.id-e.id}function Wl(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.z!==e.z?e.z-s.z:s.id-e.id}function Xl(){const s=[];let e=0;const t=[],n=[],i=[];function r(){e=0,t.length=0,n.length=0,i.length=0}function o(u,f,d,x,y,g){let m=s[e];return m===void 0?(m={id:u.id,object:u,geometry:f,material:d,groupOrder:x,renderOrder:u.renderOrder,z:y,group:g},s[e]=m):(m.id=u.id,m.object=u,m.geometry=f,m.material=d,m.groupOrder=x,m.renderOrder=u.renderOrder,m.z=y,m.group=g),e++,m}function a(u,f,d,x,y,g){const m=o(u,f,d,x,y,g);d.transmission>0?n.push(m):d.transparent===!0?i.push(m):t.push(m)}function c(u,f,d,x,y,g){const m=o(u,f,d,x,y,g);d.transmission>0?n.unshift(m):d.transparent===!0?i.unshift(m):t.unshift(m)}function l(u,f){t.length>1&&t.sort(u||o_),n.length>1&&n.sort(f||Wl),i.length>1&&i.sort(f||Wl)}function h(){for(let u=e,f=s.length;u<f;u++){const d=s[u];if(d.id===null)break;d.id=null,d.object=null,d.geometry=null,d.material=null,d.group=null}}return{opaque:t,transmissive:n,transparent:i,init:r,push:a,unshift:c,finish:h,sort:l}}function a_(){let s=new WeakMap;function e(n,i){const r=s.get(n);let o;return r===void 0?(o=new Xl,s.set(n,[o])):i>=r.length?(o=new Xl,r.push(o)):o=r[i],o}function t(){s=new WeakMap}return{get:e,dispose:t}}function c_(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new I,color:new Ve};break;case"SpotLight":t={position:new I,direction:new I,color:new Ve,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new I,color:new Ve,distance:0,decay:0};break;case"HemisphereLight":t={direction:new I,skyColor:new Ve,groundColor:new Ve};break;case"RectAreaLight":t={color:new Ve,position:new I,halfWidth:new I,halfHeight:new I};break}return s[e.id]=t,t}}}function l_(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new te};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new te};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new te,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[e.id]=t,t}}}let h_=0;function u_(s,e){return(e.castShadow?2:0)-(s.castShadow?2:0)+(e.map?1:0)-(s.map?1:0)}function d_(s){const e=new c_,t=l_(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)n.probe.push(new I);const i=new I,r=new We,o=new We;function a(l){let h=0,u=0,f=0;for(let b=0;b<9;b++)n.probe[b].set(0,0,0);let d=0,x=0,y=0,g=0,m=0,_=0,p=0,v=0,T=0,S=0,w=0;l.sort(u_);for(let b=0,M=l.length;b<M;b++){const C=l[b],D=C.color,F=C.intensity,k=C.distance,z=C.shadow&&C.shadow.map?C.shadow.map.texture:null;if(C.isAmbientLight)h+=D.r*F,u+=D.g*F,f+=D.b*F;else if(C.isLightProbe){for(let V=0;V<9;V++)n.probe[V].addScaledVector(C.sh.coefficients[V],F);w++}else if(C.isDirectionalLight){const V=e.get(C);if(V.color.copy(C.color).multiplyScalar(C.intensity),C.castShadow){const Y=C.shadow,G=t.get(C);G.shadowIntensity=Y.intensity,G.shadowBias=Y.bias,G.shadowNormalBias=Y.normalBias,G.shadowRadius=Y.radius,G.shadowMapSize=Y.mapSize,n.directionalShadow[d]=G,n.directionalShadowMap[d]=z,n.directionalShadowMatrix[d]=C.shadow.matrix,_++}n.directional[d]=V,d++}else if(C.isSpotLight){const V=e.get(C);V.position.setFromMatrixPosition(C.matrixWorld),V.color.copy(D).multiplyScalar(F),V.distance=k,V.coneCos=Math.cos(C.angle),V.penumbraCos=Math.cos(C.angle*(1-C.penumbra)),V.decay=C.decay,n.spot[y]=V;const Y=C.shadow;if(C.map&&(n.spotLightMap[T]=C.map,T++,Y.updateMatrices(C),C.castShadow&&S++),n.spotLightMatrix[y]=Y.matrix,C.castShadow){const G=t.get(C);G.shadowIntensity=Y.intensity,G.shadowBias=Y.bias,G.shadowNormalBias=Y.normalBias,G.shadowRadius=Y.radius,G.shadowMapSize=Y.mapSize,n.spotShadow[y]=G,n.spotShadowMap[y]=z,v++}y++}else if(C.isRectAreaLight){const V=e.get(C);V.color.copy(D).multiplyScalar(F),V.halfWidth.set(C.width*.5,0,0),V.halfHeight.set(0,C.height*.5,0),n.rectArea[g]=V,g++}else if(C.isPointLight){const V=e.get(C);if(V.color.copy(C.color).multiplyScalar(C.intensity),V.distance=C.distance,V.decay=C.decay,C.castShadow){const Y=C.shadow,G=t.get(C);G.shadowIntensity=Y.intensity,G.shadowBias=Y.bias,G.shadowNormalBias=Y.normalBias,G.shadowRadius=Y.radius,G.shadowMapSize=Y.mapSize,G.shadowCameraNear=Y.camera.near,G.shadowCameraFar=Y.camera.far,n.pointShadow[x]=G,n.pointShadowMap[x]=z,n.pointShadowMatrix[x]=C.shadow.matrix,p++}n.point[x]=V,x++}else if(C.isHemisphereLight){const V=e.get(C);V.skyColor.copy(C.color).multiplyScalar(F),V.groundColor.copy(C.groundColor).multiplyScalar(F),n.hemi[m]=V,m++}}g>0&&(s.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=pe.LTC_FLOAT_1,n.rectAreaLTC2=pe.LTC_FLOAT_2):(n.rectAreaLTC1=pe.LTC_HALF_1,n.rectAreaLTC2=pe.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=f;const L=n.hash;(L.directionalLength!==d||L.pointLength!==x||L.spotLength!==y||L.rectAreaLength!==g||L.hemiLength!==m||L.numDirectionalShadows!==_||L.numPointShadows!==p||L.numSpotShadows!==v||L.numSpotMaps!==T||L.numLightProbes!==w)&&(n.directional.length=d,n.spot.length=y,n.rectArea.length=g,n.point.length=x,n.hemi.length=m,n.directionalShadow.length=_,n.directionalShadowMap.length=_,n.pointShadow.length=p,n.pointShadowMap.length=p,n.spotShadow.length=v,n.spotShadowMap.length=v,n.directionalShadowMatrix.length=_,n.pointShadowMatrix.length=p,n.spotLightMatrix.length=v+T-S,n.spotLightMap.length=T,n.numSpotLightShadowsWithMaps=S,n.numLightProbes=w,L.directionalLength=d,L.pointLength=x,L.spotLength=y,L.rectAreaLength=g,L.hemiLength=m,L.numDirectionalShadows=_,L.numPointShadows=p,L.numSpotShadows=v,L.numSpotMaps=T,L.numLightProbes=w,n.version=h_++)}function c(l,h){let u=0,f=0,d=0,x=0,y=0;const g=h.matrixWorldInverse;for(let m=0,_=l.length;m<_;m++){const p=l[m];if(p.isDirectionalLight){const v=n.directional[u];v.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),v.direction.sub(i),v.direction.transformDirection(g),u++}else if(p.isSpotLight){const v=n.spot[d];v.position.setFromMatrixPosition(p.matrixWorld),v.position.applyMatrix4(g),v.direction.setFromMatrixPosition(p.matrixWorld),i.setFromMatrixPosition(p.target.matrixWorld),v.direction.sub(i),v.direction.transformDirection(g),d++}else if(p.isRectAreaLight){const v=n.rectArea[x];v.position.setFromMatrixPosition(p.matrixWorld),v.position.applyMatrix4(g),o.identity(),r.copy(p.matrixWorld),r.premultiply(g),o.extractRotation(r),v.halfWidth.set(p.width*.5,0,0),v.halfHeight.set(0,p.height*.5,0),v.halfWidth.applyMatrix4(o),v.halfHeight.applyMatrix4(o),x++}else if(p.isPointLight){const v=n.point[f];v.position.setFromMatrixPosition(p.matrixWorld),v.position.applyMatrix4(g),f++}else if(p.isHemisphereLight){const v=n.hemi[y];v.direction.setFromMatrixPosition(p.matrixWorld),v.direction.transformDirection(g),y++}}}return{setup:a,setupView:c,state:n}}function ql(s){const e=new d_(s),t=[],n=[];function i(h){l.camera=h,t.length=0,n.length=0}function r(h){t.push(h)}function o(h){n.push(h)}function a(){e.setup(t)}function c(h){e.setupView(t,h)}const l={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:i,state:l,setupLights:a,setupLightsView:c,pushLight:r,pushShadow:o}}function f_(s){let e=new WeakMap;function t(i,r=0){const o=e.get(i);let a;return o===void 0?(a=new ql(s),e.set(i,[a])):r>=o.length?(a=new ql(s),o.push(a)):a=o[r],a}function n(){e=new WeakMap}return{get:t,dispose:n}}const p_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,m_=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function x_(s,e,t){let n=new nc;const i=new te,r=new te,o=new ot,a=new up({depthPacking:bd}),c=new dp,l={},h=t.maxTextureSize,u={[Gn]:qt,[qt]:Gn,[Et]:Et},f=new Hn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new te},radius:{value:4}},vertexShader:p_,fragmentShader:m_}),d=f.clone();d.defines.HORIZONTAL_PASS=1;const x=new _t;x.setAttribute("position",new Ut(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const y=new Ze(x,f),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=hh;let m=this.type;this.render=function(S,w,L){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||S.length===0)return;const b=s.getRenderTarget(),M=s.getActiveCubeFace(),C=s.getActiveMipmapLevel(),D=s.state;D.setBlending(kn),D.buffers.depth.getReversed()===!0?D.buffers.color.setClear(0,0,0,0):D.buffers.color.setClear(1,1,1,1),D.buffers.depth.setTest(!0),D.setScissorTest(!1);const F=m!==Fn&&this.type===Fn,k=m===Fn&&this.type!==Fn;for(let z=0,V=S.length;z<V;z++){const Y=S[z],G=Y.shadow;if(G===void 0){Pe("WebGLShadowMap:",Y,"has no shadow.");continue}if(G.autoUpdate===!1&&G.needsUpdate===!1)continue;i.copy(G.mapSize);const ne=G.getFrameExtents();if(i.multiply(ne),r.copy(G.mapSize),(i.x>h||i.y>h)&&(i.x>h&&(r.x=Math.floor(h/ne.x),i.x=r.x*ne.x,G.mapSize.x=r.x),i.y>h&&(r.y=Math.floor(h/ne.y),i.y=r.y*ne.y,G.mapSize.y=r.y)),G.map===null||F===!0||k===!0){const Ae=this.type!==Fn?{minFilter:Vt,magFilter:Vt}:{};G.map!==null&&G.map.dispose(),G.map=new xi(i.x,i.y,Ae),G.map.texture.name=Y.name+".shadowMap",G.camera.updateProjectionMatrix()}s.setRenderTarget(G.map),s.clear();const oe=G.getViewportCount();for(let Ae=0;Ae<oe;Ae++){const je=G.getViewport(Ae);o.set(r.x*je.x,r.y*je.y,r.x*je.z,r.y*je.w),D.viewport(o),G.updateMatrices(Y,Ae),n=G.getFrustum(),v(w,L,G.camera,Y,this.type)}G.isPointLightShadow!==!0&&this.type===Fn&&_(G,L),G.needsUpdate=!1}m=this.type,g.needsUpdate=!1,s.setRenderTarget(b,M,C)};function _(S,w){const L=e.update(y);f.defines.VSM_SAMPLES!==S.blurSamples&&(f.defines.VSM_SAMPLES=S.blurSamples,d.defines.VSM_SAMPLES=S.blurSamples,f.needsUpdate=!0,d.needsUpdate=!0),S.mapPass===null&&(S.mapPass=new xi(i.x,i.y)),f.uniforms.shadow_pass.value=S.map.texture,f.uniforms.resolution.value=S.mapSize,f.uniforms.radius.value=S.radius,s.setRenderTarget(S.mapPass),s.clear(),s.renderBufferDirect(w,null,L,f,y,null),d.uniforms.shadow_pass.value=S.mapPass.texture,d.uniforms.resolution.value=S.mapSize,d.uniforms.radius.value=S.radius,s.setRenderTarget(S.map),s.clear(),s.renderBufferDirect(w,null,L,d,y,null)}function p(S,w,L,b){let M=null;const C=L.isPointLight===!0?S.customDistanceMaterial:S.customDepthMaterial;if(C!==void 0)M=C;else if(M=L.isPointLight===!0?c:a,s.localClippingEnabled&&w.clipShadows===!0&&Array.isArray(w.clippingPlanes)&&w.clippingPlanes.length!==0||w.displacementMap&&w.displacementScale!==0||w.alphaMap&&w.alphaTest>0||w.map&&w.alphaTest>0||w.alphaToCoverage===!0){const D=M.uuid,F=w.uuid;let k=l[D];k===void 0&&(k={},l[D]=k);let z=k[F];z===void 0&&(z=M.clone(),k[F]=z,w.addEventListener("dispose",T)),M=z}if(M.visible=w.visible,M.wireframe=w.wireframe,b===Fn?M.side=w.shadowSide!==null?w.shadowSide:w.side:M.side=w.shadowSide!==null?w.shadowSide:u[w.side],M.alphaMap=w.alphaMap,M.alphaTest=w.alphaToCoverage===!0?.5:w.alphaTest,M.map=w.map,M.clipShadows=w.clipShadows,M.clippingPlanes=w.clippingPlanes,M.clipIntersection=w.clipIntersection,M.displacementMap=w.displacementMap,M.displacementScale=w.displacementScale,M.displacementBias=w.displacementBias,M.wireframeLinewidth=w.wireframeLinewidth,M.linewidth=w.linewidth,L.isPointLight===!0&&M.isMeshDistanceMaterial===!0){const D=s.properties.get(M);D.light=L}return M}function v(S,w,L,b,M){if(S.visible===!1)return;if(S.layers.test(w.layers)&&(S.isMesh||S.isLine||S.isPoints)&&(S.castShadow||S.receiveShadow&&M===Fn)&&(!S.frustumCulled||n.intersectsObject(S))){S.modelViewMatrix.multiplyMatrices(L.matrixWorldInverse,S.matrixWorld);const F=e.update(S),k=S.material;if(Array.isArray(k)){const z=F.groups;for(let V=0,Y=z.length;V<Y;V++){const G=z[V],ne=k[G.materialIndex];if(ne&&ne.visible){const oe=p(S,ne,b,M);S.onBeforeShadow(s,S,w,L,F,oe,G),s.renderBufferDirect(L,null,F,oe,S,G),S.onAfterShadow(s,S,w,L,F,oe,G)}}}else if(k.visible){const z=p(S,k,b,M);S.onBeforeShadow(s,S,w,L,F,z,null),s.renderBufferDirect(L,null,F,z,S,null),S.onAfterShadow(s,S,w,L,F,z,null)}}const D=S.children;for(let F=0,k=D.length;F<k;F++)v(D[F],w,L,b,M)}function T(S){S.target.removeEventListener("dispose",T);for(const L in l){const b=l[L],M=S.target.uuid;M in b&&(b[M].dispose(),delete b[M])}}}const g_={[qo]:Yo,[$o]:Jo,[Ko]:Zo,[Wi]:jo,[Yo]:qo,[Jo]:$o,[Zo]:Ko,[jo]:Wi};function __(s,e){function t(){let N=!1;const me=new ot;let he=null;const ue=new ot(0,0,0,0);return{setMask:function(se){he!==se&&!N&&(s.colorMask(se,se,se,se),he=se)},setLocked:function(se){N=se},setClear:function(se,K,Te,He,xt){xt===!0&&(se*=He,K*=He,Te*=He),me.set(se,K,Te,He),ue.equals(me)===!1&&(s.clearColor(se,K,Te,He),ue.copy(me))},reset:function(){N=!1,he=null,ue.set(-1,0,0,0)}}}function n(){let N=!1,me=!1,he=null,ue=null,se=null;return{setReversed:function(K){if(me!==K){const Te=e.get("EXT_clip_control");K?Te.clipControlEXT(Te.LOWER_LEFT_EXT,Te.ZERO_TO_ONE_EXT):Te.clipControlEXT(Te.LOWER_LEFT_EXT,Te.NEGATIVE_ONE_TO_ONE_EXT),me=K;const He=se;se=null,this.setClear(He)}},getReversed:function(){return me},setTest:function(K){K?J(s.DEPTH_TEST):ye(s.DEPTH_TEST)},setMask:function(K){he!==K&&!N&&(s.depthMask(K),he=K)},setFunc:function(K){if(me&&(K=g_[K]),ue!==K){switch(K){case qo:s.depthFunc(s.NEVER);break;case Yo:s.depthFunc(s.ALWAYS);break;case $o:s.depthFunc(s.LESS);break;case Wi:s.depthFunc(s.LEQUAL);break;case Ko:s.depthFunc(s.EQUAL);break;case jo:s.depthFunc(s.GEQUAL);break;case Jo:s.depthFunc(s.GREATER);break;case Zo:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}ue=K}},setLocked:function(K){N=K},setClear:function(K){se!==K&&(me&&(K=1-K),s.clearDepth(K),se=K)},reset:function(){N=!1,he=null,ue=null,se=null,me=!1}}}function i(){let N=!1,me=null,he=null,ue=null,se=null,K=null,Te=null,He=null,xt=null;return{setTest:function(ht){N||(ht?J(s.STENCIL_TEST):ye(s.STENCIL_TEST))},setMask:function(ht){me!==ht&&!N&&(s.stencilMask(ht),me=ht)},setFunc:function(ht,_n,ln){(he!==ht||ue!==_n||se!==ln)&&(s.stencilFunc(ht,_n,ln),he=ht,ue=_n,se=ln)},setOp:function(ht,_n,ln){(K!==ht||Te!==_n||He!==ln)&&(s.stencilOp(ht,_n,ln),K=ht,Te=_n,He=ln)},setLocked:function(ht){N=ht},setClear:function(ht){xt!==ht&&(s.clearStencil(ht),xt=ht)},reset:function(){N=!1,me=null,he=null,ue=null,se=null,K=null,Te=null,He=null,xt=null}}}const r=new t,o=new n,a=new i,c=new WeakMap,l=new WeakMap;let h={},u={},f=new WeakMap,d=[],x=null,y=!1,g=null,m=null,_=null,p=null,v=null,T=null,S=null,w=new Ve(0,0,0),L=0,b=!1,M=null,C=null,D=null,F=null,k=null;const z=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let V=!1,Y=0;const G=s.getParameter(s.VERSION);G.indexOf("WebGL")!==-1?(Y=parseFloat(/^WebGL (\d)/.exec(G)[1]),V=Y>=1):G.indexOf("OpenGL ES")!==-1&&(Y=parseFloat(/^OpenGL ES (\d)/.exec(G)[1]),V=Y>=2);let ne=null,oe={};const Ae=s.getParameter(s.SCISSOR_BOX),je=s.getParameter(s.VIEWPORT),et=new ot().fromArray(Ae),rt=new ot().fromArray(je);function at(N,me,he,ue){const se=new Uint8Array(4),K=s.createTexture();s.bindTexture(N,K),s.texParameteri(N,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(N,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let Te=0;Te<he;Te++)N===s.TEXTURE_3D||N===s.TEXTURE_2D_ARRAY?s.texImage3D(me,0,s.RGBA,1,1,ue,0,s.RGBA,s.UNSIGNED_BYTE,se):s.texImage2D(me+Te,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,se);return K}const $={};$[s.TEXTURE_2D]=at(s.TEXTURE_2D,s.TEXTURE_2D,1),$[s.TEXTURE_CUBE_MAP]=at(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),$[s.TEXTURE_2D_ARRAY]=at(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),$[s.TEXTURE_3D]=at(s.TEXTURE_3D,s.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),J(s.DEPTH_TEST),o.setFunc(Wi),Z(!1),re(bc),J(s.CULL_FACE),Q(kn);function J(N){h[N]!==!0&&(s.enable(N),h[N]=!0)}function ye(N){h[N]!==!1&&(s.disable(N),h[N]=!1)}function De(N,me){return u[N]!==me?(s.bindFramebuffer(N,me),u[N]=me,N===s.DRAW_FRAMEBUFFER&&(u[s.FRAMEBUFFER]=me),N===s.FRAMEBUFFER&&(u[s.DRAW_FRAMEBUFFER]=me),!0):!1}function Re(N,me){let he=d,ue=!1;if(N){he=f.get(me),he===void 0&&(he=[],f.set(me,he));const se=N.textures;if(he.length!==se.length||he[0]!==s.COLOR_ATTACHMENT0){for(let K=0,Te=se.length;K<Te;K++)he[K]=s.COLOR_ATTACHMENT0+K;he.length=se.length,ue=!0}}else he[0]!==s.BACK&&(he[0]=s.BACK,ue=!0);ue&&s.drawBuffers(he)}function Je(N){return x!==N?(s.useProgram(N),x=N,!0):!1}const pt={[fi]:s.FUNC_ADD,[qu]:s.FUNC_SUBTRACT,[Yu]:s.FUNC_REVERSE_SUBTRACT};pt[$u]=s.MIN,pt[Ku]=s.MAX;const Be={[ju]:s.ZERO,[Ju]:s.ONE,[Zu]:s.SRC_COLOR,[Wo]:s.SRC_ALPHA,[sd]:s.SRC_ALPHA_SATURATE,[nd]:s.DST_COLOR,[ed]:s.DST_ALPHA,[Qu]:s.ONE_MINUS_SRC_COLOR,[Xo]:s.ONE_MINUS_SRC_ALPHA,[id]:s.ONE_MINUS_DST_COLOR,[td]:s.ONE_MINUS_DST_ALPHA,[rd]:s.CONSTANT_COLOR,[od]:s.ONE_MINUS_CONSTANT_COLOR,[ad]:s.CONSTANT_ALPHA,[cd]:s.ONE_MINUS_CONSTANT_ALPHA};function Q(N,me,he,ue,se,K,Te,He,xt,ht){if(N===kn){y===!0&&(ye(s.BLEND),y=!1);return}if(y===!1&&(J(s.BLEND),y=!0),N!==Xu){if(N!==g||ht!==b){if((m!==fi||v!==fi)&&(s.blendEquation(s.FUNC_ADD),m=fi,v=fi),ht)switch(N){case ki:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case Sc:s.blendFunc(s.ONE,s.ONE);break;case Tc:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case Ec:s.blendFuncSeparate(s.DST_COLOR,s.ONE_MINUS_SRC_ALPHA,s.ZERO,s.ONE);break;default:$e("WebGLState: Invalid blending: ",N);break}else switch(N){case ki:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case Sc:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE,s.ONE,s.ONE);break;case Tc:$e("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Ec:$e("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:$e("WebGLState: Invalid blending: ",N);break}_=null,p=null,T=null,S=null,w.set(0,0,0),L=0,g=N,b=ht}return}se=se||me,K=K||he,Te=Te||ue,(me!==m||se!==v)&&(s.blendEquationSeparate(pt[me],pt[se]),m=me,v=se),(he!==_||ue!==p||K!==T||Te!==S)&&(s.blendFuncSeparate(Be[he],Be[ue],Be[K],Be[Te]),_=he,p=ue,T=K,S=Te),(He.equals(w)===!1||xt!==L)&&(s.blendColor(He.r,He.g,He.b,xt),w.copy(He),L=xt),g=N,b=!1}function P(N,me){N.side===Et?ye(s.CULL_FACE):J(s.CULL_FACE);let he=N.side===qt;me&&(he=!he),Z(he),N.blending===ki&&N.transparent===!1?Q(kn):Q(N.blending,N.blendEquation,N.blendSrc,N.blendDst,N.blendEquationAlpha,N.blendSrcAlpha,N.blendDstAlpha,N.blendColor,N.blendAlpha,N.premultipliedAlpha),o.setFunc(N.depthFunc),o.setTest(N.depthTest),o.setMask(N.depthWrite),r.setMask(N.colorWrite);const ue=N.stencilWrite;a.setTest(ue),ue&&(a.setMask(N.stencilWriteMask),a.setFunc(N.stencilFunc,N.stencilRef,N.stencilFuncMask),a.setOp(N.stencilFail,N.stencilZFail,N.stencilZPass)),ie(N.polygonOffset,N.polygonOffsetFactor,N.polygonOffsetUnits),N.alphaToCoverage===!0?J(s.SAMPLE_ALPHA_TO_COVERAGE):ye(s.SAMPLE_ALPHA_TO_COVERAGE)}function Z(N){M!==N&&(N?s.frontFace(s.CW):s.frontFace(s.CCW),M=N)}function re(N){N!==Gu?(J(s.CULL_FACE),N!==C&&(N===bc?s.cullFace(s.BACK):N===Hu?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):ye(s.CULL_FACE),C=N}function ce(N){N!==D&&(V&&s.lineWidth(N),D=N)}function ie(N,me,he){N?(J(s.POLYGON_OFFSET_FILL),(F!==me||k!==he)&&(s.polygonOffset(me,he),F=me,k=he)):ye(s.POLYGON_OFFSET_FILL)}function be(N){N?J(s.SCISSOR_TEST):ye(s.SCISSOR_TEST)}function de(N){N===void 0&&(N=s.TEXTURE0+z-1),ne!==N&&(s.activeTexture(N),ne=N)}function ve(N,me,he){he===void 0&&(ne===null?he=s.TEXTURE0+z-1:he=ne);let ue=oe[he];ue===void 0&&(ue={type:void 0,texture:void 0},oe[he]=ue),(ue.type!==N||ue.texture!==me)&&(ne!==he&&(s.activeTexture(he),ne=he),s.bindTexture(N,me||$[N]),ue.type=N,ue.texture=me)}function R(){const N=oe[ne];N!==void 0&&N.type!==void 0&&(s.bindTexture(N.type,null),N.type=void 0,N.texture=void 0)}function E(){try{s.compressedTexImage2D(...arguments)}catch(N){N("WebGLState:",N)}}function B(){try{s.compressedTexImage3D(...arguments)}catch(N){N("WebGLState:",N)}}function q(){try{s.texSubImage2D(...arguments)}catch(N){N("WebGLState:",N)}}function j(){try{s.texSubImage3D(...arguments)}catch(N){N("WebGLState:",N)}}function X(){try{s.compressedTexSubImage2D(...arguments)}catch(N){N("WebGLState:",N)}}function Ce(){try{s.compressedTexSubImage3D(...arguments)}catch(N){N("WebGLState:",N)}}function fe(){try{s.texStorage2D(...arguments)}catch(N){N("WebGLState:",N)}}function Le(){try{s.texStorage3D(...arguments)}catch(N){N("WebGLState:",N)}}function we(){try{s.texImage2D(...arguments)}catch(N){N("WebGLState:",N)}}function ee(){try{s.texImage3D(...arguments)}catch(N){N("WebGLState:",N)}}function le(N){et.equals(N)===!1&&(s.scissor(N.x,N.y,N.z,N.w),et.copy(N))}function Oe(N){rt.equals(N)===!1&&(s.viewport(N.x,N.y,N.z,N.w),rt.copy(N))}function Ue(N,me){let he=l.get(me);he===void 0&&(he=new WeakMap,l.set(me,he));let ue=he.get(N);ue===void 0&&(ue=s.getUniformBlockIndex(me,N.name),he.set(N,ue))}function ge(N,me){const ue=l.get(me).get(N);c.get(me)!==ue&&(s.uniformBlockBinding(me,ue,N.__bindingPointIndex),c.set(me,ue))}function ke(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),o.setReversed(!1),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),h={},ne=null,oe={},u={},f=new WeakMap,d=[],x=null,y=!1,g=null,m=null,_=null,p=null,v=null,T=null,S=null,w=new Ve(0,0,0),L=0,b=!1,M=null,C=null,D=null,F=null,k=null,et.set(0,0,s.canvas.width,s.canvas.height),rt.set(0,0,s.canvas.width,s.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:J,disable:ye,bindFramebuffer:De,drawBuffers:Re,useProgram:Je,setBlending:Q,setMaterial:P,setFlipSided:Z,setCullFace:re,setLineWidth:ce,setPolygonOffset:ie,setScissorTest:be,activeTexture:de,bindTexture:ve,unbindTexture:R,compressedTexImage2D:E,compressedTexImage3D:B,texImage2D:we,texImage3D:ee,updateUBOMapping:Ue,uniformBlockBinding:ge,texStorage2D:fe,texStorage3D:Le,texSubImage2D:q,texSubImage3D:j,compressedTexSubImage2D:X,compressedTexSubImage3D:Ce,scissor:le,viewport:Oe,reset:ke}}function v_(s,e,t,n,i,r,o){const a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new te,h=new WeakMap;let u;const f=new WeakMap;let d=!1;try{d=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function x(R,E){return d?new OffscreenCanvas(R,E):ks("canvas")}function y(R,E,B){let q=1;const j=ve(R);if((j.width>B||j.height>B)&&(q=B/Math.max(j.width,j.height)),q<1)if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap||typeof VideoFrame<"u"&&R instanceof VideoFrame){const X=Math.floor(q*j.width),Ce=Math.floor(q*j.height);u===void 0&&(u=x(X,Ce));const fe=E?x(X,Ce):u;return fe.width=X,fe.height=Ce,fe.getContext("2d").drawImage(R,0,0,X,Ce),Pe("WebGLRenderer: Texture has been resized from ("+j.width+"x"+j.height+") to ("+X+"x"+Ce+")."),fe}else return"data"in R&&Pe("WebGLRenderer: Image in DataTexture is too big ("+j.width+"x"+j.height+")."),R;return R}function g(R){return R.generateMipmaps}function m(R){s.generateMipmap(R)}function _(R){return R.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:R.isWebGL3DRenderTarget?s.TEXTURE_3D:R.isWebGLArrayRenderTarget||R.isCompressedArrayTexture?s.TEXTURE_2D_ARRAY:s.TEXTURE_2D}function p(R,E,B,q,j=!1){if(R!==null){if(s[R]!==void 0)return s[R];Pe("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let X=E;if(E===s.RED&&(B===s.FLOAT&&(X=s.R32F),B===s.HALF_FLOAT&&(X=s.R16F),B===s.UNSIGNED_BYTE&&(X=s.R8)),E===s.RED_INTEGER&&(B===s.UNSIGNED_BYTE&&(X=s.R8UI),B===s.UNSIGNED_SHORT&&(X=s.R16UI),B===s.UNSIGNED_INT&&(X=s.R32UI),B===s.BYTE&&(X=s.R8I),B===s.SHORT&&(X=s.R16I),B===s.INT&&(X=s.R32I)),E===s.RG&&(B===s.FLOAT&&(X=s.RG32F),B===s.HALF_FLOAT&&(X=s.RG16F),B===s.UNSIGNED_BYTE&&(X=s.RG8)),E===s.RG_INTEGER&&(B===s.UNSIGNED_BYTE&&(X=s.RG8UI),B===s.UNSIGNED_SHORT&&(X=s.RG16UI),B===s.UNSIGNED_INT&&(X=s.RG32UI),B===s.BYTE&&(X=s.RG8I),B===s.SHORT&&(X=s.RG16I),B===s.INT&&(X=s.RG32I)),E===s.RGB_INTEGER&&(B===s.UNSIGNED_BYTE&&(X=s.RGB8UI),B===s.UNSIGNED_SHORT&&(X=s.RGB16UI),B===s.UNSIGNED_INT&&(X=s.RGB32UI),B===s.BYTE&&(X=s.RGB8I),B===s.SHORT&&(X=s.RGB16I),B===s.INT&&(X=s.RGB32I)),E===s.RGBA_INTEGER&&(B===s.UNSIGNED_BYTE&&(X=s.RGBA8UI),B===s.UNSIGNED_SHORT&&(X=s.RGBA16UI),B===s.UNSIGNED_INT&&(X=s.RGBA32UI),B===s.BYTE&&(X=s.RGBA8I),B===s.SHORT&&(X=s.RGBA16I),B===s.INT&&(X=s.RGBA32I)),E===s.RGB&&(B===s.UNSIGNED_INT_5_9_9_9_REV&&(X=s.RGB9_E5),B===s.UNSIGNED_INT_10F_11F_11F_REV&&(X=s.R11F_G11F_B10F)),E===s.RGBA){const Ce=j?Or:nt.getTransfer(q);B===s.FLOAT&&(X=s.RGBA32F),B===s.HALF_FLOAT&&(X=s.RGBA16F),B===s.UNSIGNED_BYTE&&(X=Ce===dt?s.SRGB8_ALPHA8:s.RGBA8),B===s.UNSIGNED_SHORT_4_4_4_4&&(X=s.RGBA4),B===s.UNSIGNED_SHORT_5_5_5_1&&(X=s.RGB5_A1)}return(X===s.R16F||X===s.R32F||X===s.RG16F||X===s.RG32F||X===s.RGBA16F||X===s.RGBA32F)&&e.get("EXT_color_buffer_float"),X}function v(R,E){let B;return R?E===null||E===mi||E===Us?B=s.DEPTH24_STENCIL8:E===mn?B=s.DEPTH32F_STENCIL8:E===Ns&&(B=s.DEPTH24_STENCIL8,Pe("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):E===null||E===mi||E===Us?B=s.DEPTH_COMPONENT24:E===mn?B=s.DEPTH_COMPONENT32F:E===Ns&&(B=s.DEPTH_COMPONENT16),B}function T(R,E){return g(R)===!0||R.isFramebufferTexture&&R.minFilter!==Vt&&R.minFilter!==zt?Math.log2(Math.max(E.width,E.height))+1:R.mipmaps!==void 0&&R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?E.mipmaps.length:1}function S(R){const E=R.target;E.removeEventListener("dispose",S),L(E),E.isVideoTexture&&h.delete(E)}function w(R){const E=R.target;E.removeEventListener("dispose",w),M(E)}function L(R){const E=n.get(R);if(E.__webglInit===void 0)return;const B=R.source,q=f.get(B);if(q){const j=q[E.__cacheKey];j.usedTimes--,j.usedTimes===0&&b(R),Object.keys(q).length===0&&f.delete(B)}n.remove(R)}function b(R){const E=n.get(R);s.deleteTexture(E.__webglTexture);const B=R.source,q=f.get(B);delete q[E.__cacheKey],o.memory.textures--}function M(R){const E=n.get(R);if(R.depthTexture&&(R.depthTexture.dispose(),n.remove(R.depthTexture)),R.isWebGLCubeRenderTarget)for(let q=0;q<6;q++){if(Array.isArray(E.__webglFramebuffer[q]))for(let j=0;j<E.__webglFramebuffer[q].length;j++)s.deleteFramebuffer(E.__webglFramebuffer[q][j]);else s.deleteFramebuffer(E.__webglFramebuffer[q]);E.__webglDepthbuffer&&s.deleteRenderbuffer(E.__webglDepthbuffer[q])}else{if(Array.isArray(E.__webglFramebuffer))for(let q=0;q<E.__webglFramebuffer.length;q++)s.deleteFramebuffer(E.__webglFramebuffer[q]);else s.deleteFramebuffer(E.__webglFramebuffer);if(E.__webglDepthbuffer&&s.deleteRenderbuffer(E.__webglDepthbuffer),E.__webglMultisampledFramebuffer&&s.deleteFramebuffer(E.__webglMultisampledFramebuffer),E.__webglColorRenderbuffer)for(let q=0;q<E.__webglColorRenderbuffer.length;q++)E.__webglColorRenderbuffer[q]&&s.deleteRenderbuffer(E.__webglColorRenderbuffer[q]);E.__webglDepthRenderbuffer&&s.deleteRenderbuffer(E.__webglDepthRenderbuffer)}const B=R.textures;for(let q=0,j=B.length;q<j;q++){const X=n.get(B[q]);X.__webglTexture&&(s.deleteTexture(X.__webglTexture),o.memory.textures--),n.remove(B[q])}n.remove(R)}let C=0;function D(){C=0}function F(){const R=C;return R>=i.maxTextures&&Pe("WebGLTextures: Trying to use "+R+" texture units while this GPU supports only "+i.maxTextures),C+=1,R}function k(R){const E=[];return E.push(R.wrapS),E.push(R.wrapT),E.push(R.wrapR||0),E.push(R.magFilter),E.push(R.minFilter),E.push(R.anisotropy),E.push(R.internalFormat),E.push(R.format),E.push(R.type),E.push(R.generateMipmaps),E.push(R.premultiplyAlpha),E.push(R.flipY),E.push(R.unpackAlignment),E.push(R.colorSpace),E.join()}function z(R,E){const B=n.get(R);if(R.isVideoTexture&&be(R),R.isRenderTargetTexture===!1&&R.isExternalTexture!==!0&&R.version>0&&B.__version!==R.version){const q=R.image;if(q===null)Pe("WebGLRenderer: Texture marked for update but no image data found.");else if(q.complete===!1)Pe("WebGLRenderer: Texture marked for update but image is incomplete");else{$(B,R,E);return}}else R.isExternalTexture&&(B.__webglTexture=R.sourceTexture?R.sourceTexture:null);t.bindTexture(s.TEXTURE_2D,B.__webglTexture,s.TEXTURE0+E)}function V(R,E){const B=n.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&B.__version!==R.version){$(B,R,E);return}else R.isExternalTexture&&(B.__webglTexture=R.sourceTexture?R.sourceTexture:null);t.bindTexture(s.TEXTURE_2D_ARRAY,B.__webglTexture,s.TEXTURE0+E)}function Y(R,E){const B=n.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&B.__version!==R.version){$(B,R,E);return}t.bindTexture(s.TEXTURE_3D,B.__webglTexture,s.TEXTURE0+E)}function G(R,E){const B=n.get(R);if(R.version>0&&B.__version!==R.version){J(B,R,E);return}t.bindTexture(s.TEXTURE_CUBE_MAP,B.__webglTexture,s.TEXTURE0+E)}const ne={[Yi]:s.REPEAT,[bn]:s.CLAMP_TO_EDGE,[Fr]:s.MIRRORED_REPEAT},oe={[Vt]:s.NEAREST,[fh]:s.NEAREST_MIPMAP_NEAREST,[Ss]:s.NEAREST_MIPMAP_LINEAR,[zt]:s.LINEAR,[Pr]:s.LINEAR_MIPMAP_NEAREST,[On]:s.LINEAR_MIPMAP_LINEAR},Ae={[Td]:s.NEVER,[Pd]:s.ALWAYS,[Ed]:s.LESS,[bh]:s.LEQUAL,[Ad]:s.EQUAL,[Cd]:s.GEQUAL,[wd]:s.GREATER,[Rd]:s.NOTEQUAL};function je(R,E){if(E.type===mn&&e.has("OES_texture_float_linear")===!1&&(E.magFilter===zt||E.magFilter===Pr||E.magFilter===Ss||E.magFilter===On||E.minFilter===zt||E.minFilter===Pr||E.minFilter===Ss||E.minFilter===On)&&Pe("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(R,s.TEXTURE_WRAP_S,ne[E.wrapS]),s.texParameteri(R,s.TEXTURE_WRAP_T,ne[E.wrapT]),(R===s.TEXTURE_3D||R===s.TEXTURE_2D_ARRAY)&&s.texParameteri(R,s.TEXTURE_WRAP_R,ne[E.wrapR]),s.texParameteri(R,s.TEXTURE_MAG_FILTER,oe[E.magFilter]),s.texParameteri(R,s.TEXTURE_MIN_FILTER,oe[E.minFilter]),E.compareFunction&&(s.texParameteri(R,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(R,s.TEXTURE_COMPARE_FUNC,Ae[E.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(E.magFilter===Vt||E.minFilter!==Ss&&E.minFilter!==On||E.type===mn&&e.has("OES_texture_float_linear")===!1)return;if(E.anisotropy>1||n.get(E).__currentAnisotropy){const B=e.get("EXT_texture_filter_anisotropic");s.texParameterf(R,B.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(E.anisotropy,i.getMaxAnisotropy())),n.get(E).__currentAnisotropy=E.anisotropy}}}function et(R,E){let B=!1;R.__webglInit===void 0&&(R.__webglInit=!0,E.addEventListener("dispose",S));const q=E.source;let j=f.get(q);j===void 0&&(j={},f.set(q,j));const X=k(E);if(X!==R.__cacheKey){j[X]===void 0&&(j[X]={texture:s.createTexture(),usedTimes:0},o.memory.textures++,B=!0),j[X].usedTimes++;const Ce=j[R.__cacheKey];Ce!==void 0&&(j[R.__cacheKey].usedTimes--,Ce.usedTimes===0&&b(E)),R.__cacheKey=X,R.__webglTexture=j[X].texture}return B}function rt(R,E,B){return Math.floor(Math.floor(R/B)/E)}function at(R,E,B,q){const X=R.updateRanges;if(X.length===0)t.texSubImage2D(s.TEXTURE_2D,0,0,0,E.width,E.height,B,q,E.data);else{X.sort((ee,le)=>ee.start-le.start);let Ce=0;for(let ee=1;ee<X.length;ee++){const le=X[Ce],Oe=X[ee],Ue=le.start+le.count,ge=rt(Oe.start,E.width,4),ke=rt(le.start,E.width,4);Oe.start<=Ue+1&&ge===ke&&rt(Oe.start+Oe.count-1,E.width,4)===ge?le.count=Math.max(le.count,Oe.start+Oe.count-le.start):(++Ce,X[Ce]=Oe)}X.length=Ce+1;const fe=s.getParameter(s.UNPACK_ROW_LENGTH),Le=s.getParameter(s.UNPACK_SKIP_PIXELS),we=s.getParameter(s.UNPACK_SKIP_ROWS);s.pixelStorei(s.UNPACK_ROW_LENGTH,E.width);for(let ee=0,le=X.length;ee<le;ee++){const Oe=X[ee],Ue=Math.floor(Oe.start/4),ge=Math.ceil(Oe.count/4),ke=Ue%E.width,N=Math.floor(Ue/E.width),me=ge,he=1;s.pixelStorei(s.UNPACK_SKIP_PIXELS,ke),s.pixelStorei(s.UNPACK_SKIP_ROWS,N),t.texSubImage2D(s.TEXTURE_2D,0,ke,N,me,he,B,q,E.data)}R.clearUpdateRanges(),s.pixelStorei(s.UNPACK_ROW_LENGTH,fe),s.pixelStorei(s.UNPACK_SKIP_PIXELS,Le),s.pixelStorei(s.UNPACK_SKIP_ROWS,we)}}function $(R,E,B){let q=s.TEXTURE_2D;(E.isDataArrayTexture||E.isCompressedArrayTexture)&&(q=s.TEXTURE_2D_ARRAY),E.isData3DTexture&&(q=s.TEXTURE_3D);const j=et(R,E),X=E.source;t.bindTexture(q,R.__webglTexture,s.TEXTURE0+B);const Ce=n.get(X);if(X.version!==Ce.__version||j===!0){t.activeTexture(s.TEXTURE0+B);const fe=nt.getPrimaries(nt.workingColorSpace),Le=E.colorSpace===Zn?null:nt.getPrimaries(E.colorSpace),we=E.colorSpace===Zn||fe===Le?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,E.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,E.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,E.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,we);let ee=y(E.image,!1,i.maxTextureSize);ee=de(E,ee);const le=r.convert(E.format,E.colorSpace),Oe=r.convert(E.type);let Ue=p(E.internalFormat,le,Oe,E.colorSpace,E.isVideoTexture);je(q,E);let ge;const ke=E.mipmaps,N=E.isVideoTexture!==!0,me=Ce.__version===void 0||j===!0,he=X.dataReady,ue=T(E,ee);if(E.isDepthTexture)Ue=v(E.format===Os,E.type),me&&(N?t.texStorage2D(s.TEXTURE_2D,1,Ue,ee.width,ee.height):t.texImage2D(s.TEXTURE_2D,0,Ue,ee.width,ee.height,0,le,Oe,null));else if(E.isDataTexture)if(ke.length>0){N&&me&&t.texStorage2D(s.TEXTURE_2D,ue,Ue,ke[0].width,ke[0].height);for(let se=0,K=ke.length;se<K;se++)ge=ke[se],N?he&&t.texSubImage2D(s.TEXTURE_2D,se,0,0,ge.width,ge.height,le,Oe,ge.data):t.texImage2D(s.TEXTURE_2D,se,Ue,ge.width,ge.height,0,le,Oe,ge.data);E.generateMipmaps=!1}else N?(me&&t.texStorage2D(s.TEXTURE_2D,ue,Ue,ee.width,ee.height),he&&at(E,ee,le,Oe)):t.texImage2D(s.TEXTURE_2D,0,Ue,ee.width,ee.height,0,le,Oe,ee.data);else if(E.isCompressedTexture)if(E.isCompressedArrayTexture){N&&me&&t.texStorage3D(s.TEXTURE_2D_ARRAY,ue,Ue,ke[0].width,ke[0].height,ee.depth);for(let se=0,K=ke.length;se<K;se++)if(ge=ke[se],E.format!==an)if(le!==null)if(N){if(he)if(E.layerUpdates.size>0){const Te=Sl(ge.width,ge.height,E.format,E.type);for(const He of E.layerUpdates){const xt=ge.data.subarray(He*Te/ge.data.BYTES_PER_ELEMENT,(He+1)*Te/ge.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,se,0,0,He,ge.width,ge.height,1,le,xt)}E.clearLayerUpdates()}else t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,se,0,0,0,ge.width,ge.height,ee.depth,le,ge.data)}else t.compressedTexImage3D(s.TEXTURE_2D_ARRAY,se,Ue,ge.width,ge.height,ee.depth,0,ge.data,0,0);else Pe("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else N?he&&t.texSubImage3D(s.TEXTURE_2D_ARRAY,se,0,0,0,ge.width,ge.height,ee.depth,le,Oe,ge.data):t.texImage3D(s.TEXTURE_2D_ARRAY,se,Ue,ge.width,ge.height,ee.depth,0,le,Oe,ge.data)}else{N&&me&&t.texStorage2D(s.TEXTURE_2D,ue,Ue,ke[0].width,ke[0].height);for(let se=0,K=ke.length;se<K;se++)ge=ke[se],E.format!==an?le!==null?N?he&&t.compressedTexSubImage2D(s.TEXTURE_2D,se,0,0,ge.width,ge.height,le,ge.data):t.compressedTexImage2D(s.TEXTURE_2D,se,Ue,ge.width,ge.height,0,ge.data):Pe("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):N?he&&t.texSubImage2D(s.TEXTURE_2D,se,0,0,ge.width,ge.height,le,Oe,ge.data):t.texImage2D(s.TEXTURE_2D,se,Ue,ge.width,ge.height,0,le,Oe,ge.data)}else if(E.isDataArrayTexture)if(N){if(me&&t.texStorage3D(s.TEXTURE_2D_ARRAY,ue,Ue,ee.width,ee.height,ee.depth),he)if(E.layerUpdates.size>0){const se=Sl(ee.width,ee.height,E.format,E.type);for(const K of E.layerUpdates){const Te=ee.data.subarray(K*se/ee.data.BYTES_PER_ELEMENT,(K+1)*se/ee.data.BYTES_PER_ELEMENT);t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,K,ee.width,ee.height,1,le,Oe,Te)}E.clearLayerUpdates()}else t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,ee.width,ee.height,ee.depth,le,Oe,ee.data)}else t.texImage3D(s.TEXTURE_2D_ARRAY,0,Ue,ee.width,ee.height,ee.depth,0,le,Oe,ee.data);else if(E.isData3DTexture)N?(me&&t.texStorage3D(s.TEXTURE_3D,ue,Ue,ee.width,ee.height,ee.depth),he&&t.texSubImage3D(s.TEXTURE_3D,0,0,0,0,ee.width,ee.height,ee.depth,le,Oe,ee.data)):t.texImage3D(s.TEXTURE_3D,0,Ue,ee.width,ee.height,ee.depth,0,le,Oe,ee.data);else if(E.isFramebufferTexture){if(me)if(N)t.texStorage2D(s.TEXTURE_2D,ue,Ue,ee.width,ee.height);else{let se=ee.width,K=ee.height;for(let Te=0;Te<ue;Te++)t.texImage2D(s.TEXTURE_2D,Te,Ue,se,K,0,le,Oe,null),se>>=1,K>>=1}}else if(ke.length>0){if(N&&me){const se=ve(ke[0]);t.texStorage2D(s.TEXTURE_2D,ue,Ue,se.width,se.height)}for(let se=0,K=ke.length;se<K;se++)ge=ke[se],N?he&&t.texSubImage2D(s.TEXTURE_2D,se,0,0,le,Oe,ge):t.texImage2D(s.TEXTURE_2D,se,Ue,le,Oe,ge);E.generateMipmaps=!1}else if(N){if(me){const se=ve(ee);t.texStorage2D(s.TEXTURE_2D,ue,Ue,se.width,se.height)}he&&t.texSubImage2D(s.TEXTURE_2D,0,0,0,le,Oe,ee)}else t.texImage2D(s.TEXTURE_2D,0,Ue,le,Oe,ee);g(E)&&m(q),Ce.__version=X.version,E.onUpdate&&E.onUpdate(E)}R.__version=E.version}function J(R,E,B){if(E.image.length!==6)return;const q=et(R,E),j=E.source;t.bindTexture(s.TEXTURE_CUBE_MAP,R.__webglTexture,s.TEXTURE0+B);const X=n.get(j);if(j.version!==X.__version||q===!0){t.activeTexture(s.TEXTURE0+B);const Ce=nt.getPrimaries(nt.workingColorSpace),fe=E.colorSpace===Zn?null:nt.getPrimaries(E.colorSpace),Le=E.colorSpace===Zn||Ce===fe?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,E.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,E.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,E.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,Le);const we=E.isCompressedTexture||E.image[0].isCompressedTexture,ee=E.image[0]&&E.image[0].isDataTexture,le=[];for(let K=0;K<6;K++)!we&&!ee?le[K]=y(E.image[K],!0,i.maxCubemapSize):le[K]=ee?E.image[K].image:E.image[K],le[K]=de(E,le[K]);const Oe=le[0],Ue=r.convert(E.format,E.colorSpace),ge=r.convert(E.type),ke=p(E.internalFormat,Ue,ge,E.colorSpace),N=E.isVideoTexture!==!0,me=X.__version===void 0||q===!0,he=j.dataReady;let ue=T(E,Oe);je(s.TEXTURE_CUBE_MAP,E);let se;if(we){N&&me&&t.texStorage2D(s.TEXTURE_CUBE_MAP,ue,ke,Oe.width,Oe.height);for(let K=0;K<6;K++){se=le[K].mipmaps;for(let Te=0;Te<se.length;Te++){const He=se[Te];E.format!==an?Ue!==null?N?he&&t.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+K,Te,0,0,He.width,He.height,Ue,He.data):t.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+K,Te,ke,He.width,He.height,0,He.data):Pe("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):N?he&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+K,Te,0,0,He.width,He.height,Ue,ge,He.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+K,Te,ke,He.width,He.height,0,Ue,ge,He.data)}}}else{if(se=E.mipmaps,N&&me){se.length>0&&ue++;const K=ve(le[0]);t.texStorage2D(s.TEXTURE_CUBE_MAP,ue,ke,K.width,K.height)}for(let K=0;K<6;K++)if(ee){N?he&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,0,0,le[K].width,le[K].height,Ue,ge,le[K].data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,ke,le[K].width,le[K].height,0,Ue,ge,le[K].data);for(let Te=0;Te<se.length;Te++){const xt=se[Te].image[K].image;N?he&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+K,Te+1,0,0,xt.width,xt.height,Ue,ge,xt.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+K,Te+1,ke,xt.width,xt.height,0,Ue,ge,xt.data)}}else{N?he&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,0,0,Ue,ge,le[K]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,ke,Ue,ge,le[K]);for(let Te=0;Te<se.length;Te++){const He=se[Te];N?he&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+K,Te+1,0,0,Ue,ge,He.image[K]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+K,Te+1,ke,Ue,ge,He.image[K])}}}g(E)&&m(s.TEXTURE_CUBE_MAP),X.__version=j.version,E.onUpdate&&E.onUpdate(E)}R.__version=E.version}function ye(R,E,B,q,j,X){const Ce=r.convert(B.format,B.colorSpace),fe=r.convert(B.type),Le=p(B.internalFormat,Ce,fe,B.colorSpace),we=n.get(E),ee=n.get(B);if(ee.__renderTarget=E,!we.__hasExternalTextures){const le=Math.max(1,E.width>>X),Oe=Math.max(1,E.height>>X);j===s.TEXTURE_3D||j===s.TEXTURE_2D_ARRAY?t.texImage3D(j,X,Le,le,Oe,E.depth,0,Ce,fe,null):t.texImage2D(j,X,Le,le,Oe,0,Ce,fe,null)}t.bindFramebuffer(s.FRAMEBUFFER,R),ie(E)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,q,j,ee.__webglTexture,0,ce(E)):(j===s.TEXTURE_2D||j>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&j<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,q,j,ee.__webglTexture,X),t.bindFramebuffer(s.FRAMEBUFFER,null)}function De(R,E,B){if(s.bindRenderbuffer(s.RENDERBUFFER,R),E.depthBuffer){const q=E.depthTexture,j=q&&q.isDepthTexture?q.type:null,X=v(E.stencilBuffer,j),Ce=E.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,fe=ce(E);ie(E)?a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,fe,X,E.width,E.height):B?s.renderbufferStorageMultisample(s.RENDERBUFFER,fe,X,E.width,E.height):s.renderbufferStorage(s.RENDERBUFFER,X,E.width,E.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,Ce,s.RENDERBUFFER,R)}else{const q=E.textures;for(let j=0;j<q.length;j++){const X=q[j],Ce=r.convert(X.format,X.colorSpace),fe=r.convert(X.type),Le=p(X.internalFormat,Ce,fe,X.colorSpace),we=ce(E);B&&ie(E)===!1?s.renderbufferStorageMultisample(s.RENDERBUFFER,we,Le,E.width,E.height):ie(E)?a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,we,Le,E.width,E.height):s.renderbufferStorage(s.RENDERBUFFER,Le,E.width,E.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function Re(R,E){if(E&&E.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(s.FRAMEBUFFER,R),!(E.depthTexture&&E.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const q=n.get(E.depthTexture);q.__renderTarget=E,(!q.__webglTexture||E.depthTexture.image.width!==E.width||E.depthTexture.image.height!==E.height)&&(E.depthTexture.image.width=E.width,E.depthTexture.image.height=E.height,E.depthTexture.needsUpdate=!0),z(E.depthTexture,0);const j=q.__webglTexture,X=ce(E);if(E.depthTexture.format===Fs)ie(E)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,j,0,X):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,j,0);else if(E.depthTexture.format===Os)ie(E)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,j,0,X):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,j,0);else throw new Error("Unknown depthTexture format")}function Je(R){const E=n.get(R),B=R.isWebGLCubeRenderTarget===!0;if(E.__boundDepthTexture!==R.depthTexture){const q=R.depthTexture;if(E.__depthDisposeCallback&&E.__depthDisposeCallback(),q){const j=()=>{delete E.__boundDepthTexture,delete E.__depthDisposeCallback,q.removeEventListener("dispose",j)};q.addEventListener("dispose",j),E.__depthDisposeCallback=j}E.__boundDepthTexture=q}if(R.depthTexture&&!E.__autoAllocateDepthBuffer){if(B)throw new Error("target.depthTexture not supported in Cube render targets");const q=R.texture.mipmaps;q&&q.length>0?Re(E.__webglFramebuffer[0],R):Re(E.__webglFramebuffer,R)}else if(B){E.__webglDepthbuffer=[];for(let q=0;q<6;q++)if(t.bindFramebuffer(s.FRAMEBUFFER,E.__webglFramebuffer[q]),E.__webglDepthbuffer[q]===void 0)E.__webglDepthbuffer[q]=s.createRenderbuffer(),De(E.__webglDepthbuffer[q],R,!1);else{const j=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,X=E.__webglDepthbuffer[q];s.bindRenderbuffer(s.RENDERBUFFER,X),s.framebufferRenderbuffer(s.FRAMEBUFFER,j,s.RENDERBUFFER,X)}}else{const q=R.texture.mipmaps;if(q&&q.length>0?t.bindFramebuffer(s.FRAMEBUFFER,E.__webglFramebuffer[0]):t.bindFramebuffer(s.FRAMEBUFFER,E.__webglFramebuffer),E.__webglDepthbuffer===void 0)E.__webglDepthbuffer=s.createRenderbuffer(),De(E.__webglDepthbuffer,R,!1);else{const j=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,X=E.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,X),s.framebufferRenderbuffer(s.FRAMEBUFFER,j,s.RENDERBUFFER,X)}}t.bindFramebuffer(s.FRAMEBUFFER,null)}function pt(R,E,B){const q=n.get(R);E!==void 0&&ye(q.__webglFramebuffer,R,R.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),B!==void 0&&Je(R)}function Be(R){const E=R.texture,B=n.get(R),q=n.get(E);R.addEventListener("dispose",w);const j=R.textures,X=R.isWebGLCubeRenderTarget===!0,Ce=j.length>1;if(Ce||(q.__webglTexture===void 0&&(q.__webglTexture=s.createTexture()),q.__version=E.version,o.memory.textures++),X){B.__webglFramebuffer=[];for(let fe=0;fe<6;fe++)if(E.mipmaps&&E.mipmaps.length>0){B.__webglFramebuffer[fe]=[];for(let Le=0;Le<E.mipmaps.length;Le++)B.__webglFramebuffer[fe][Le]=s.createFramebuffer()}else B.__webglFramebuffer[fe]=s.createFramebuffer()}else{if(E.mipmaps&&E.mipmaps.length>0){B.__webglFramebuffer=[];for(let fe=0;fe<E.mipmaps.length;fe++)B.__webglFramebuffer[fe]=s.createFramebuffer()}else B.__webglFramebuffer=s.createFramebuffer();if(Ce)for(let fe=0,Le=j.length;fe<Le;fe++){const we=n.get(j[fe]);we.__webglTexture===void 0&&(we.__webglTexture=s.createTexture(),o.memory.textures++)}if(R.samples>0&&ie(R)===!1){B.__webglMultisampledFramebuffer=s.createFramebuffer(),B.__webglColorRenderbuffer=[],t.bindFramebuffer(s.FRAMEBUFFER,B.__webglMultisampledFramebuffer);for(let fe=0;fe<j.length;fe++){const Le=j[fe];B.__webglColorRenderbuffer[fe]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,B.__webglColorRenderbuffer[fe]);const we=r.convert(Le.format,Le.colorSpace),ee=r.convert(Le.type),le=p(Le.internalFormat,we,ee,Le.colorSpace,R.isXRRenderTarget===!0),Oe=ce(R);s.renderbufferStorageMultisample(s.RENDERBUFFER,Oe,le,R.width,R.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+fe,s.RENDERBUFFER,B.__webglColorRenderbuffer[fe])}s.bindRenderbuffer(s.RENDERBUFFER,null),R.depthBuffer&&(B.__webglDepthRenderbuffer=s.createRenderbuffer(),De(B.__webglDepthRenderbuffer,R,!0)),t.bindFramebuffer(s.FRAMEBUFFER,null)}}if(X){t.bindTexture(s.TEXTURE_CUBE_MAP,q.__webglTexture),je(s.TEXTURE_CUBE_MAP,E);for(let fe=0;fe<6;fe++)if(E.mipmaps&&E.mipmaps.length>0)for(let Le=0;Le<E.mipmaps.length;Le++)ye(B.__webglFramebuffer[fe][Le],R,E,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+fe,Le);else ye(B.__webglFramebuffer[fe],R,E,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+fe,0);g(E)&&m(s.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Ce){for(let fe=0,Le=j.length;fe<Le;fe++){const we=j[fe],ee=n.get(we);let le=s.TEXTURE_2D;(R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(le=R.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),t.bindTexture(le,ee.__webglTexture),je(le,we),ye(B.__webglFramebuffer,R,we,s.COLOR_ATTACHMENT0+fe,le,0),g(we)&&m(le)}t.unbindTexture()}else{let fe=s.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(fe=R.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),t.bindTexture(fe,q.__webglTexture),je(fe,E),E.mipmaps&&E.mipmaps.length>0)for(let Le=0;Le<E.mipmaps.length;Le++)ye(B.__webglFramebuffer[Le],R,E,s.COLOR_ATTACHMENT0,fe,Le);else ye(B.__webglFramebuffer,R,E,s.COLOR_ATTACHMENT0,fe,0);g(E)&&m(fe),t.unbindTexture()}R.depthBuffer&&Je(R)}function Q(R){const E=R.textures;for(let B=0,q=E.length;B<q;B++){const j=E[B];if(g(j)){const X=_(R),Ce=n.get(j).__webglTexture;t.bindTexture(X,Ce),m(X),t.unbindTexture()}}}const P=[],Z=[];function re(R){if(R.samples>0){if(ie(R)===!1){const E=R.textures,B=R.width,q=R.height;let j=s.COLOR_BUFFER_BIT;const X=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,Ce=n.get(R),fe=E.length>1;if(fe)for(let we=0;we<E.length;we++)t.bindFramebuffer(s.FRAMEBUFFER,Ce.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+we,s.RENDERBUFFER,null),t.bindFramebuffer(s.FRAMEBUFFER,Ce.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+we,s.TEXTURE_2D,null,0);t.bindFramebuffer(s.READ_FRAMEBUFFER,Ce.__webglMultisampledFramebuffer);const Le=R.texture.mipmaps;Le&&Le.length>0?t.bindFramebuffer(s.DRAW_FRAMEBUFFER,Ce.__webglFramebuffer[0]):t.bindFramebuffer(s.DRAW_FRAMEBUFFER,Ce.__webglFramebuffer);for(let we=0;we<E.length;we++){if(R.resolveDepthBuffer&&(R.depthBuffer&&(j|=s.DEPTH_BUFFER_BIT),R.stencilBuffer&&R.resolveStencilBuffer&&(j|=s.STENCIL_BUFFER_BIT)),fe){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,Ce.__webglColorRenderbuffer[we]);const ee=n.get(E[we]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,ee,0)}s.blitFramebuffer(0,0,B,q,0,0,B,q,j,s.NEAREST),c===!0&&(P.length=0,Z.length=0,P.push(s.COLOR_ATTACHMENT0+we),R.depthBuffer&&R.resolveDepthBuffer===!1&&(P.push(X),Z.push(X),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,Z)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,P))}if(t.bindFramebuffer(s.READ_FRAMEBUFFER,null),t.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),fe)for(let we=0;we<E.length;we++){t.bindFramebuffer(s.FRAMEBUFFER,Ce.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+we,s.RENDERBUFFER,Ce.__webglColorRenderbuffer[we]);const ee=n.get(E[we]).__webglTexture;t.bindFramebuffer(s.FRAMEBUFFER,Ce.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+we,s.TEXTURE_2D,ee,0)}t.bindFramebuffer(s.DRAW_FRAMEBUFFER,Ce.__webglMultisampledFramebuffer)}else if(R.depthBuffer&&R.resolveDepthBuffer===!1&&c){const E=R.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[E])}}}function ce(R){return Math.min(i.maxSamples,R.samples)}function ie(R){const E=n.get(R);return R.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&E.__useRenderToTexture!==!1}function be(R){const E=o.render.frame;h.get(R)!==E&&(h.set(R,E),R.update())}function de(R,E){const B=R.colorSpace,q=R.format,j=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||B!==Gt&&B!==Zn&&(nt.getTransfer(B)===dt?(q!==an||j!==Tn)&&Pe("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):$e("WebGLTextures: Unsupported texture color space:",B)),E}function ve(R){return typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement?(l.width=R.naturalWidth||R.width,l.height=R.naturalHeight||R.height):typeof VideoFrame<"u"&&R instanceof VideoFrame?(l.width=R.displayWidth,l.height=R.displayHeight):(l.width=R.width,l.height=R.height),l}this.allocateTextureUnit=F,this.resetTextureUnits=D,this.setTexture2D=z,this.setTexture2DArray=V,this.setTexture3D=Y,this.setTextureCube=G,this.rebindTextures=pt,this.setupRenderTarget=Be,this.updateRenderTargetMipmap=Q,this.updateMultisampleRenderTarget=re,this.setupDepthRenderbuffer=Je,this.setupFrameBufferTexture=ye,this.useMultisampledRTT=ie}function y_(s,e){function t(n,i=Zn){let r;const o=nt.getTransfer(i);if(n===Tn)return s.UNSIGNED_BYTE;if(n===Ha)return s.UNSIGNED_SHORT_4_4_4_4;if(n===Wa)return s.UNSIGNED_SHORT_5_5_5_1;if(n===xh)return s.UNSIGNED_INT_5_9_9_9_REV;if(n===gh)return s.UNSIGNED_INT_10F_11F_11F_REV;if(n===ph)return s.BYTE;if(n===mh)return s.SHORT;if(n===Ns)return s.UNSIGNED_SHORT;if(n===Ga)return s.INT;if(n===mi)return s.UNSIGNED_INT;if(n===mn)return s.FLOAT;if(n===ts)return s.HALF_FLOAT;if(n===_h)return s.ALPHA;if(n===vh)return s.RGB;if(n===an)return s.RGBA;if(n===Fs)return s.DEPTH_COMPONENT;if(n===Os)return s.DEPTH_STENCIL;if(n===Xa)return s.RED;if(n===qa)return s.RED_INTEGER;if(n===Ya)return s.RG;if(n===$a)return s.RG_INTEGER;if(n===Ka)return s.RGBA_INTEGER;if(n===Lr||n===Ir||n===Dr||n===Nr)if(o===dt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Lr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Ir)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Dr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Nr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Lr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Ir)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Dr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Nr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===ta||n===na||n===ia||n===sa)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===ta)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===na)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===ia)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===sa)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===ra||n===oa||n===aa)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===ra||n===oa)return o===dt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===aa)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===ca||n===la||n===ha||n===ua||n===da||n===fa||n===pa||n===ma||n===xa||n===ga||n===_a||n===va||n===ya||n===Ma)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===ca)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===la)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===ha)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===ua)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===da)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===fa)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===pa)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===ma)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===xa)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===ga)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===_a)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===va)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===ya)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Ma)return o===dt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===ba||n===Sa||n===Ta)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===ba)return o===dt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Sa)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Ta)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Ea||n===Aa||n===wa||n===Ra)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===Ea)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Aa)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===wa)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Ra)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Us?s.UNSIGNED_INT_24_8:s[n]!==void 0?s[n]:null}return{convert:t}}const M_=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,b_=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class S_{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const n=new zh(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new Hn({vertexShader:M_,fragmentShader:b_,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Ze(new Yr(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class T_ extends ns{constructor(e,t){super();const n=this;let i=null,r=1,o=null,a="local-floor",c=1,l=null,h=null,u=null,f=null,d=null,x=null;const y=typeof XRWebGLBinding<"u",g=new S_,m={},_=t.getContextAttributes();let p=null,v=null;const T=[],S=[],w=new te;let L=null;const b=new Xt;b.viewport=new ot;const M=new Xt;M.viewport=new ot;const C=[b,M],D=new Np;let F=null,k=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function($){let J=T[$];return J===void 0&&(J=new Mo,T[$]=J),J.getTargetRaySpace()},this.getControllerGrip=function($){let J=T[$];return J===void 0&&(J=new Mo,T[$]=J),J.getGripSpace()},this.getHand=function($){let J=T[$];return J===void 0&&(J=new Mo,T[$]=J),J.getHandSpace()};function z($){const J=S.indexOf($.inputSource);if(J===-1)return;const ye=T[J];ye!==void 0&&(ye.update($.inputSource,$.frame,l||o),ye.dispatchEvent({type:$.type,data:$.inputSource}))}function V(){i.removeEventListener("select",z),i.removeEventListener("selectstart",z),i.removeEventListener("selectend",z),i.removeEventListener("squeeze",z),i.removeEventListener("squeezestart",z),i.removeEventListener("squeezeend",z),i.removeEventListener("end",V),i.removeEventListener("inputsourceschange",Y);for(let $=0;$<T.length;$++){const J=S[$];J!==null&&(S[$]=null,T[$].disconnect(J))}F=null,k=null,g.reset();for(const $ in m)delete m[$];e.setRenderTarget(p),d=null,f=null,u=null,i=null,v=null,at.stop(),n.isPresenting=!1,e.setPixelRatio(L),e.setSize(w.width,w.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function($){r=$,n.isPresenting===!0&&Pe("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function($){a=$,n.isPresenting===!0&&Pe("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||o},this.setReferenceSpace=function($){l=$},this.getBaseLayer=function(){return f!==null?f:d},this.getBinding=function(){return u===null&&y&&(u=new XRWebGLBinding(i,t)),u},this.getFrame=function(){return x},this.getSession=function(){return i},this.setSession=async function($){if(i=$,i!==null){if(p=e.getRenderTarget(),i.addEventListener("select",z),i.addEventListener("selectstart",z),i.addEventListener("selectend",z),i.addEventListener("squeeze",z),i.addEventListener("squeezestart",z),i.addEventListener("squeezeend",z),i.addEventListener("end",V),i.addEventListener("inputsourceschange",Y),_.xrCompatible!==!0&&await t.makeXRCompatible(),L=e.getPixelRatio(),e.getSize(w),y&&"createProjectionLayer"in XRWebGLBinding.prototype){let ye=null,De=null,Re=null;_.depth&&(Re=_.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ye=_.stencil?Os:Fs,De=_.stencil?Us:mi);const Je={colorFormat:t.RGBA8,depthFormat:Re,scaleFactor:r};u=this.getBinding(),f=u.createProjectionLayer(Je),i.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),v=new xi(f.textureWidth,f.textureHeight,{format:an,type:Tn,depthTexture:new Bh(f.textureWidth,f.textureHeight,De,void 0,void 0,void 0,void 0,void 0,void 0,ye),stencilBuffer:_.stencil,colorSpace:e.outputColorSpace,samples:_.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}else{const ye={antialias:_.antialias,alpha:!0,depth:_.depth,stencil:_.stencil,framebufferScaleFactor:r};d=new XRWebGLLayer(i,t,ye),i.updateRenderState({baseLayer:d}),e.setPixelRatio(1),e.setSize(d.framebufferWidth,d.framebufferHeight,!1),v=new xi(d.framebufferWidth,d.framebufferHeight,{format:an,type:Tn,colorSpace:e.outputColorSpace,stencilBuffer:_.stencil,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(c),l=null,o=await i.requestReferenceSpace(a),at.setContext(i),at.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return g.getDepthTexture()};function Y($){for(let J=0;J<$.removed.length;J++){const ye=$.removed[J],De=S.indexOf(ye);De>=0&&(S[De]=null,T[De].disconnect(ye))}for(let J=0;J<$.added.length;J++){const ye=$.added[J];let De=S.indexOf(ye);if(De===-1){for(let Je=0;Je<T.length;Je++)if(Je>=S.length){S.push(ye),De=Je;break}else if(S[Je]===null){S[Je]=ye,De=Je;break}if(De===-1)break}const Re=T[De];Re&&Re.connect(ye)}}const G=new I,ne=new I;function oe($,J,ye){G.setFromMatrixPosition(J.matrixWorld),ne.setFromMatrixPosition(ye.matrixWorld);const De=G.distanceTo(ne),Re=J.projectionMatrix.elements,Je=ye.projectionMatrix.elements,pt=Re[14]/(Re[10]-1),Be=Re[14]/(Re[10]+1),Q=(Re[9]+1)/Re[5],P=(Re[9]-1)/Re[5],Z=(Re[8]-1)/Re[0],re=(Je[8]+1)/Je[0],ce=pt*Z,ie=pt*re,be=De/(-Z+re),de=be*-Z;if(J.matrixWorld.decompose($.position,$.quaternion,$.scale),$.translateX(de),$.translateZ(be),$.matrixWorld.compose($.position,$.quaternion,$.scale),$.matrixWorldInverse.copy($.matrixWorld).invert(),Re[10]===-1)$.projectionMatrix.copy(J.projectionMatrix),$.projectionMatrixInverse.copy(J.projectionMatrixInverse);else{const ve=pt+be,R=Be+be,E=ce-de,B=ie+(De-de),q=Q*Be/R*ve,j=P*Be/R*ve;$.projectionMatrix.makePerspective(E,B,q,j,ve,R),$.projectionMatrixInverse.copy($.projectionMatrix).invert()}}function Ae($,J){J===null?$.matrixWorld.copy($.matrix):$.matrixWorld.multiplyMatrices(J.matrixWorld,$.matrix),$.matrixWorldInverse.copy($.matrixWorld).invert()}this.updateCamera=function($){if(i===null)return;let J=$.near,ye=$.far;g.texture!==null&&(g.depthNear>0&&(J=g.depthNear),g.depthFar>0&&(ye=g.depthFar)),D.near=M.near=b.near=J,D.far=M.far=b.far=ye,(F!==D.near||k!==D.far)&&(i.updateRenderState({depthNear:D.near,depthFar:D.far}),F=D.near,k=D.far),D.layers.mask=$.layers.mask|6,b.layers.mask=D.layers.mask&3,M.layers.mask=D.layers.mask&5;const De=$.parent,Re=D.cameras;Ae(D,De);for(let Je=0;Je<Re.length;Je++)Ae(Re[Je],De);Re.length===2?oe(D,b,M):D.projectionMatrix.copy(b.projectionMatrix),je($,D,De)};function je($,J,ye){ye===null?$.matrix.copy(J.matrixWorld):($.matrix.copy(ye.matrixWorld),$.matrix.invert(),$.matrix.multiply(J.matrixWorld)),$.matrix.decompose($.position,$.quaternion,$.scale),$.updateMatrixWorld(!0),$.projectionMatrix.copy(J.projectionMatrix),$.projectionMatrixInverse.copy(J.projectionMatrixInverse),$.isPerspectiveCamera&&($.fov=$i*2*Math.atan(1/$.projectionMatrix.elements[5]),$.zoom=1)}this.getCamera=function(){return D},this.getFoveation=function(){if(!(f===null&&d===null))return c},this.setFoveation=function($){c=$,f!==null&&(f.fixedFoveation=$),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=$)},this.hasDepthSensing=function(){return g.texture!==null},this.getDepthSensingMesh=function(){return g.getMesh(D)},this.getCameraTexture=function($){return m[$]};let et=null;function rt($,J){if(h=J.getViewerPose(l||o),x=J,h!==null){const ye=h.views;d!==null&&(e.setRenderTargetFramebuffer(v,d.framebuffer),e.setRenderTarget(v));let De=!1;ye.length!==D.cameras.length&&(D.cameras.length=0,De=!0);for(let Be=0;Be<ye.length;Be++){const Q=ye[Be];let P=null;if(d!==null)P=d.getViewport(Q);else{const re=u.getViewSubImage(f,Q);P=re.viewport,Be===0&&(e.setRenderTargetTextures(v,re.colorTexture,re.depthStencilTexture),e.setRenderTarget(v))}let Z=C[Be];Z===void 0&&(Z=new Xt,Z.layers.enable(Be),Z.viewport=new ot,C[Be]=Z),Z.matrix.fromArray(Q.transform.matrix),Z.matrix.decompose(Z.position,Z.quaternion,Z.scale),Z.projectionMatrix.fromArray(Q.projectionMatrix),Z.projectionMatrixInverse.copy(Z.projectionMatrix).invert(),Z.viewport.set(P.x,P.y,P.width,P.height),Be===0&&(D.matrix.copy(Z.matrix),D.matrix.decompose(D.position,D.quaternion,D.scale)),De===!0&&D.cameras.push(Z)}const Re=i.enabledFeatures;if(Re&&Re.includes("depth-sensing")&&i.depthUsage=="gpu-optimized"&&y){u=n.getBinding();const Be=u.getDepthInformation(ye[0]);Be&&Be.isValid&&Be.texture&&g.init(Be,i.renderState)}if(Re&&Re.includes("camera-access")&&y){e.state.unbindTexture(),u=n.getBinding();for(let Be=0;Be<ye.length;Be++){const Q=ye[Be].camera;if(Q){let P=m[Q];P||(P=new zh,m[Q]=P);const Z=u.getCameraImage(Q);P.sourceTexture=Z}}}}for(let ye=0;ye<T.length;ye++){const De=S[ye],Re=T[ye];De!==null&&Re!==void 0&&Re.update(De,J,l||o)}et&&et($,J),J.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:J}),x=null}const at=new ru;at.setAnimationLoop(rt),this.setAnimationLoop=function($){et=$},this.dispose=function(){}}}const hi=new En,E_=new We;function A_(s,e){function t(g,m){g.matrixAutoUpdate===!0&&g.updateMatrix(),m.value.copy(g.matrix)}function n(g,m){m.color.getRGB(g.fogColor.value,Rh(s)),m.isFog?(g.fogNear.value=m.near,g.fogFar.value=m.far):m.isFogExp2&&(g.fogDensity.value=m.density)}function i(g,m,_,p,v){m.isMeshBasicMaterial||m.isMeshLambertMaterial?r(g,m):m.isMeshToonMaterial?(r(g,m),u(g,m)):m.isMeshPhongMaterial?(r(g,m),h(g,m)):m.isMeshStandardMaterial?(r(g,m),f(g,m),m.isMeshPhysicalMaterial&&d(g,m,v)):m.isMeshMatcapMaterial?(r(g,m),x(g,m)):m.isMeshDepthMaterial?r(g,m):m.isMeshDistanceMaterial?(r(g,m),y(g,m)):m.isMeshNormalMaterial?r(g,m):m.isLineBasicMaterial?(o(g,m),m.isLineDashedMaterial&&a(g,m)):m.isPointsMaterial?c(g,m,_,p):m.isSpriteMaterial?l(g,m):m.isShadowMaterial?(g.color.value.copy(m.color),g.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function r(g,m){g.opacity.value=m.opacity,m.color&&g.diffuse.value.copy(m.color),m.emissive&&g.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(g.map.value=m.map,t(m.map,g.mapTransform)),m.alphaMap&&(g.alphaMap.value=m.alphaMap,t(m.alphaMap,g.alphaMapTransform)),m.bumpMap&&(g.bumpMap.value=m.bumpMap,t(m.bumpMap,g.bumpMapTransform),g.bumpScale.value=m.bumpScale,m.side===qt&&(g.bumpScale.value*=-1)),m.normalMap&&(g.normalMap.value=m.normalMap,t(m.normalMap,g.normalMapTransform),g.normalScale.value.copy(m.normalScale),m.side===qt&&g.normalScale.value.negate()),m.displacementMap&&(g.displacementMap.value=m.displacementMap,t(m.displacementMap,g.displacementMapTransform),g.displacementScale.value=m.displacementScale,g.displacementBias.value=m.displacementBias),m.emissiveMap&&(g.emissiveMap.value=m.emissiveMap,t(m.emissiveMap,g.emissiveMapTransform)),m.specularMap&&(g.specularMap.value=m.specularMap,t(m.specularMap,g.specularMapTransform)),m.alphaTest>0&&(g.alphaTest.value=m.alphaTest);const _=e.get(m),p=_.envMap,v=_.envMapRotation;p&&(g.envMap.value=p,hi.copy(v),hi.x*=-1,hi.y*=-1,hi.z*=-1,p.isCubeTexture&&p.isRenderTargetTexture===!1&&(hi.y*=-1,hi.z*=-1),g.envMapRotation.value.setFromMatrix4(E_.makeRotationFromEuler(hi)),g.flipEnvMap.value=p.isCubeTexture&&p.isRenderTargetTexture===!1?-1:1,g.reflectivity.value=m.reflectivity,g.ior.value=m.ior,g.refractionRatio.value=m.refractionRatio),m.lightMap&&(g.lightMap.value=m.lightMap,g.lightMapIntensity.value=m.lightMapIntensity,t(m.lightMap,g.lightMapTransform)),m.aoMap&&(g.aoMap.value=m.aoMap,g.aoMapIntensity.value=m.aoMapIntensity,t(m.aoMap,g.aoMapTransform))}function o(g,m){g.diffuse.value.copy(m.color),g.opacity.value=m.opacity,m.map&&(g.map.value=m.map,t(m.map,g.mapTransform))}function a(g,m){g.dashSize.value=m.dashSize,g.totalSize.value=m.dashSize+m.gapSize,g.scale.value=m.scale}function c(g,m,_,p){g.diffuse.value.copy(m.color),g.opacity.value=m.opacity,g.size.value=m.size*_,g.scale.value=p*.5,m.map&&(g.map.value=m.map,t(m.map,g.uvTransform)),m.alphaMap&&(g.alphaMap.value=m.alphaMap,t(m.alphaMap,g.alphaMapTransform)),m.alphaTest>0&&(g.alphaTest.value=m.alphaTest)}function l(g,m){g.diffuse.value.copy(m.color),g.opacity.value=m.opacity,g.rotation.value=m.rotation,m.map&&(g.map.value=m.map,t(m.map,g.mapTransform)),m.alphaMap&&(g.alphaMap.value=m.alphaMap,t(m.alphaMap,g.alphaMapTransform)),m.alphaTest>0&&(g.alphaTest.value=m.alphaTest)}function h(g,m){g.specular.value.copy(m.specular),g.shininess.value=Math.max(m.shininess,1e-4)}function u(g,m){m.gradientMap&&(g.gradientMap.value=m.gradientMap)}function f(g,m){g.metalness.value=m.metalness,m.metalnessMap&&(g.metalnessMap.value=m.metalnessMap,t(m.metalnessMap,g.metalnessMapTransform)),g.roughness.value=m.roughness,m.roughnessMap&&(g.roughnessMap.value=m.roughnessMap,t(m.roughnessMap,g.roughnessMapTransform)),m.envMap&&(g.envMapIntensity.value=m.envMapIntensity)}function d(g,m,_){g.ior.value=m.ior,m.sheen>0&&(g.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),g.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(g.sheenColorMap.value=m.sheenColorMap,t(m.sheenColorMap,g.sheenColorMapTransform)),m.sheenRoughnessMap&&(g.sheenRoughnessMap.value=m.sheenRoughnessMap,t(m.sheenRoughnessMap,g.sheenRoughnessMapTransform))),m.clearcoat>0&&(g.clearcoat.value=m.clearcoat,g.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(g.clearcoatMap.value=m.clearcoatMap,t(m.clearcoatMap,g.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,t(m.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(g.clearcoatNormalMap.value=m.clearcoatNormalMap,t(m.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===qt&&g.clearcoatNormalScale.value.negate())),m.dispersion>0&&(g.dispersion.value=m.dispersion),m.iridescence>0&&(g.iridescence.value=m.iridescence,g.iridescenceIOR.value=m.iridescenceIOR,g.iridescenceThicknessMinimum.value=m.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=m.iridescenceThicknessRange[1],m.iridescenceMap&&(g.iridescenceMap.value=m.iridescenceMap,t(m.iridescenceMap,g.iridescenceMapTransform)),m.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=m.iridescenceThicknessMap,t(m.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),m.transmission>0&&(g.transmission.value=m.transmission,g.transmissionSamplerMap.value=_.texture,g.transmissionSamplerSize.value.set(_.width,_.height),m.transmissionMap&&(g.transmissionMap.value=m.transmissionMap,t(m.transmissionMap,g.transmissionMapTransform)),g.thickness.value=m.thickness,m.thicknessMap&&(g.thicknessMap.value=m.thicknessMap,t(m.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=m.attenuationDistance,g.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(g.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(g.anisotropyMap.value=m.anisotropyMap,t(m.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=m.specularIntensity,g.specularColor.value.copy(m.specularColor),m.specularColorMap&&(g.specularColorMap.value=m.specularColorMap,t(m.specularColorMap,g.specularColorMapTransform)),m.specularIntensityMap&&(g.specularIntensityMap.value=m.specularIntensityMap,t(m.specularIntensityMap,g.specularIntensityMapTransform))}function x(g,m){m.matcap&&(g.matcap.value=m.matcap)}function y(g,m){const _=e.get(m).light;g.referencePosition.value.setFromMatrixPosition(_.matrixWorld),g.nearDistance.value=_.shadow.camera.near,g.farDistance.value=_.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function w_(s,e,t,n){let i={},r={},o=[];const a=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function c(_,p){const v=p.program;n.uniformBlockBinding(_,v)}function l(_,p){let v=i[_.id];v===void 0&&(x(_),v=h(_),i[_.id]=v,_.addEventListener("dispose",g));const T=p.program;n.updateUBOMapping(_,T);const S=e.render.frame;r[_.id]!==S&&(f(_),r[_.id]=S)}function h(_){const p=u();_.__bindingPointIndex=p;const v=s.createBuffer(),T=_.__size,S=_.usage;return s.bindBuffer(s.UNIFORM_BUFFER,v),s.bufferData(s.UNIFORM_BUFFER,T,S),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,p,v),v}function u(){for(let _=0;_<a;_++)if(o.indexOf(_)===-1)return o.push(_),_;return $e("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(_){const p=i[_.id],v=_.uniforms,T=_.__cache;s.bindBuffer(s.UNIFORM_BUFFER,p);for(let S=0,w=v.length;S<w;S++){const L=Array.isArray(v[S])?v[S]:[v[S]];for(let b=0,M=L.length;b<M;b++){const C=L[b];if(d(C,S,b,T)===!0){const D=C.__offset,F=Array.isArray(C.value)?C.value:[C.value];let k=0;for(let z=0;z<F.length;z++){const V=F[z],Y=y(V);typeof V=="number"||typeof V=="boolean"?(C.__data[0]=V,s.bufferSubData(s.UNIFORM_BUFFER,D+k,C.__data)):V.isMatrix3?(C.__data[0]=V.elements[0],C.__data[1]=V.elements[1],C.__data[2]=V.elements[2],C.__data[3]=0,C.__data[4]=V.elements[3],C.__data[5]=V.elements[4],C.__data[6]=V.elements[5],C.__data[7]=0,C.__data[8]=V.elements[6],C.__data[9]=V.elements[7],C.__data[10]=V.elements[8],C.__data[11]=0):(V.toArray(C.__data,k),k+=Y.storage/Float32Array.BYTES_PER_ELEMENT)}s.bufferSubData(s.UNIFORM_BUFFER,D,C.__data)}}}s.bindBuffer(s.UNIFORM_BUFFER,null)}function d(_,p,v,T){const S=_.value,w=p+"_"+v;if(T[w]===void 0)return typeof S=="number"||typeof S=="boolean"?T[w]=S:T[w]=S.clone(),!0;{const L=T[w];if(typeof S=="number"||typeof S=="boolean"){if(L!==S)return T[w]=S,!0}else if(L.equals(S)===!1)return L.copy(S),!0}return!1}function x(_){const p=_.uniforms;let v=0;const T=16;for(let w=0,L=p.length;w<L;w++){const b=Array.isArray(p[w])?p[w]:[p[w]];for(let M=0,C=b.length;M<C;M++){const D=b[M],F=Array.isArray(D.value)?D.value:[D.value];for(let k=0,z=F.length;k<z;k++){const V=F[k],Y=y(V),G=v%T,ne=G%Y.boundary,oe=G+ne;v+=ne,oe!==0&&T-oe<Y.storage&&(v+=T-oe),D.__data=new Float32Array(Y.storage/Float32Array.BYTES_PER_ELEMENT),D.__offset=v,v+=Y.storage}}}const S=v%T;return S>0&&(v+=T-S),_.__size=v,_.__cache={},this}function y(_){const p={boundary:0,storage:0};return typeof _=="number"||typeof _=="boolean"?(p.boundary=4,p.storage=4):_.isVector2?(p.boundary=8,p.storage=8):_.isVector3||_.isColor?(p.boundary=16,p.storage=12):_.isVector4?(p.boundary=16,p.storage=16):_.isMatrix3?(p.boundary=48,p.storage=48):_.isMatrix4?(p.boundary=64,p.storage=64):_.isTexture?Pe("WebGLRenderer: Texture samplers can not be part of an uniforms group."):Pe("WebGLRenderer: Unsupported uniform value type.",_),p}function g(_){const p=_.target;p.removeEventListener("dispose",g);const v=o.indexOf(p.__bindingPointIndex);o.splice(v,1),s.deleteBuffer(i[p.id]),delete i[p.id],delete r[p.id]}function m(){for(const _ in i)s.deleteBuffer(i[_]);o=[],i={},r={}}return{bind:c,update:l,dispose:m}}const R_=new Uint16Array([11481,15204,11534,15171,11808,15015,12385,14843,12894,14716,13396,14600,13693,14483,13976,14366,14237,14171,14405,13961,14511,13770,14605,13598,14687,13444,14760,13305,14822,13066,14876,12857,14923,12675,14963,12517,14997,12379,15025,12230,15049,12023,15070,11843,15086,11687,15100,11551,15111,11433,15120,11330,15127,11217,15132,11060,15135,10922,15138,10801,15139,10695,15139,10600,13012,14923,13020,14917,13064,14886,13176,14800,13349,14666,13513,14526,13724,14398,13960,14230,14200,14020,14383,13827,14488,13651,14583,13491,14667,13348,14740,13132,14803,12908,14856,12713,14901,12542,14938,12394,14968,12241,14992,12017,15010,11822,15024,11654,15034,11507,15041,11380,15044,11269,15044,11081,15042,10913,15037,10764,15031,10635,15023,10520,15014,10419,15003,10330,13657,14676,13658,14673,13670,14660,13698,14622,13750,14547,13834,14442,13956,14317,14112,14093,14291,13889,14407,13704,14499,13538,14586,13389,14664,13201,14733,12966,14792,12758,14842,12577,14882,12418,14915,12272,14940,12033,14959,11826,14972,11646,14980,11490,14983,11355,14983,11212,14979,11008,14971,10830,14961,10675,14950,10540,14936,10420,14923,10315,14909,10204,14894,10041,14089,14460,14090,14459,14096,14452,14112,14431,14141,14388,14186,14305,14252,14130,14341,13941,14399,13756,14467,13585,14539,13430,14610,13272,14677,13026,14737,12808,14790,12617,14833,12449,14869,12303,14896,12065,14916,11845,14929,11655,14937,11490,14939,11347,14936,11184,14930,10970,14921,10783,14912,10621,14900,10480,14885,10356,14867,10247,14848,10062,14827,9894,14805,9745,14400,14208,14400,14206,14402,14198,14406,14174,14415,14122,14427,14035,14444,13913,14469,13767,14504,13613,14548,13463,14598,13324,14651,13082,14704,12858,14752,12658,14795,12483,14831,12330,14860,12106,14881,11875,14895,11675,14903,11501,14905,11351,14903,11178,14900,10953,14892,10757,14880,10589,14865,10442,14847,10313,14827,10162,14805,9965,14782,9792,14757,9642,14731,9507,14562,13883,14562,13883,14563,13877,14566,13862,14570,13830,14576,13773,14584,13689,14595,13582,14613,13461,14637,13336,14668,13120,14704,12897,14741,12695,14776,12516,14808,12358,14835,12150,14856,11910,14870,11701,14878,11519,14882,11361,14884,11187,14880,10951,14871,10748,14858,10572,14842,10418,14823,10286,14801,10099,14777,9897,14751,9722,14725,9567,14696,9430,14666,9309,14702,13604,14702,13604,14702,13600,14703,13591,14705,13570,14707,13533,14709,13477,14712,13400,14718,13305,14727,13106,14743,12907,14762,12716,14784,12539,14807,12380,14827,12190,14844,11943,14855,11727,14863,11539,14870,11376,14871,11204,14868,10960,14858,10748,14845,10565,14829,10406,14809,10269,14786,10058,14761,9852,14734,9671,14705,9512,14674,9374,14641,9253,14608,9076,14821,13366,14821,13365,14821,13364,14821,13358,14821,13344,14821,13320,14819,13252,14817,13145,14815,13011,14814,12858,14817,12698,14823,12539,14832,12389,14841,12214,14850,11968,14856,11750,14861,11558,14866,11390,14867,11226,14862,10972,14853,10754,14840,10565,14823,10401,14803,10259,14780,10032,14754,9820,14725,9635,14694,9473,14661,9333,14627,9203,14593,8988,14557,8798,14923,13014,14922,13014,14922,13012,14922,13004,14920,12987,14919,12957,14915,12907,14909,12834,14902,12738,14894,12623,14888,12498,14883,12370,14880,12203,14878,11970,14875,11759,14873,11569,14874,11401,14872,11243,14865,10986,14855,10762,14842,10568,14825,10401,14804,10255,14781,10017,14754,9799,14725,9611,14692,9445,14658,9301,14623,9139,14587,8920,14548,8729,14509,8562,15008,12672,15008,12672,15008,12671,15007,12667,15005,12656,15001,12637,14997,12605,14989,12556,14978,12490,14966,12407,14953,12313,14940,12136,14927,11934,14914,11742,14903,11563,14896,11401,14889,11247,14879,10992,14866,10767,14851,10570,14833,10400,14812,10252,14789,10007,14761,9784,14731,9592,14698,9424,14663,9279,14627,9088,14588,8868,14548,8676,14508,8508,14467,8360,15080,12386,15080,12386,15079,12385,15078,12383,15076,12378,15072,12367,15066,12347,15057,12315,15045,12253,15030,12138,15012,11998,14993,11845,14972,11685,14951,11530,14935,11383,14920,11228,14904,10981,14887,10762,14870,10567,14850,10397,14827,10248,14803,9997,14774,9771,14743,9578,14710,9407,14674,9259,14637,9048,14596,8826,14555,8632,14514,8464,14471,8317,14427,8182,15139,12008,15139,12008,15138,12008,15137,12007,15135,12003,15130,11990,15124,11969,15115,11929,15102,11872,15086,11794,15064,11693,15041,11581,15013,11459,14987,11336,14966,11170,14944,10944,14921,10738,14898,10552,14875,10387,14850,10239,14824,9983,14794,9758,14762,9563,14728,9392,14692,9244,14653,9014,14611,8791,14569,8597,14526,8427,14481,8281,14436,8110,14391,7885,15188,11617,15188,11617,15187,11617,15186,11618,15183,11617,15179,11612,15173,11601,15163,11581,15150,11546,15133,11495,15110,11427,15083,11346,15051,11246,15024,11057,14996,10868,14967,10687,14938,10517,14911,10362,14882,10206,14853,9956,14821,9737,14787,9543,14752,9375,14715,9228,14675,8980,14632,8760,14589,8565,14544,8395,14498,8248,14451,8049,14404,7824,14357,7630,15228,11298,15228,11298,15227,11299,15226,11301,15223,11303,15219,11302,15213,11299,15204,11290,15191,11271,15174,11217,15150,11129,15119,11015,15087,10886,15057,10744,15024,10599,14990,10455,14957,10318,14924,10143,14891,9911,14856,9701,14820,9516,14782,9352,14744,9200,14703,8946,14659,8725,14615,8533,14568,8366,14521,8220,14472,7992,14423,7770,14374,7578,14315,7408,15260,10819,15260,10819,15259,10822,15258,10826,15256,10832,15251,10836,15246,10841,15237,10838,15225,10821,15207,10788,15183,10734,15151,10660,15120,10571,15087,10469,15049,10359,15012,10249,14974,10041,14937,9837,14900,9647,14860,9475,14820,9320,14779,9147,14736,8902,14691,8688,14646,8499,14598,8335,14549,8189,14499,7940,14448,7720,14397,7529,14347,7363,14256,7218,15285,10410,15285,10411,15285,10413,15284,10418,15282,10425,15278,10434,15272,10442,15264,10449,15252,10445,15235,10433,15210,10403,15179,10358,15149,10301,15113,10218,15073,10059,15033,9894,14991,9726,14951,9565,14909,9413,14865,9273,14822,9073,14777,8845,14730,8641,14682,8459,14633,8300,14583,8129,14531,7883,14479,7670,14426,7482,14373,7321,14305,7176,14201,6939,15305,9939,15305,9940,15305,9945,15304,9955,15302,9967,15298,9989,15293,10010,15286,10033,15274,10044,15258,10045,15233,10022,15205,9975,15174,9903,15136,9808,15095,9697,15053,9578,15009,9451,14965,9327,14918,9198,14871,8973,14825,8766,14775,8579,14725,8408,14675,8259,14622,8058,14569,7821,14515,7615,14460,7435,14405,7276,14350,7108,14256,6866,14149,6653,15321,9444,15321,9445,15321,9448,15320,9458,15317,9470,15314,9490,15310,9515,15302,9540,15292,9562,15276,9579,15251,9577,15226,9559,15195,9519,15156,9463,15116,9389,15071,9304,15025,9208,14978,9023,14927,8838,14878,8661,14827,8496,14774,8344,14722,8206,14667,7973,14612,7749,14556,7555,14499,7382,14443,7229,14385,7025,14322,6791,14210,6588,14100,6409,15333,8920,15333,8921,15332,8927,15332,8943,15329,8965,15326,9002,15322,9048,15316,9106,15307,9162,15291,9204,15267,9221,15244,9221,15212,9196,15175,9134,15133,9043,15088,8930,15040,8801,14990,8665,14938,8526,14886,8391,14830,8261,14775,8087,14719,7866,14661,7664,14603,7482,14544,7322,14485,7178,14426,6936,14367,6713,14281,6517,14166,6348,14054,6198,15341,8360,15341,8361,15341,8366,15341,8379,15339,8399,15336,8431,15332,8473,15326,8527,15318,8585,15302,8632,15281,8670,15258,8690,15227,8690,15191,8664,15149,8612,15104,8543,15055,8456,15001,8360,14948,8259,14892,8122,14834,7923,14776,7734,14716,7558,14656,7397,14595,7250,14534,7070,14472,6835,14410,6628,14350,6443,14243,6283,14125,6135,14010,5889,15348,7715,15348,7717,15348,7725,15347,7745,15345,7780,15343,7836,15339,7905,15334,8e3,15326,8103,15310,8193,15293,8239,15270,8270,15240,8287,15204,8283,15163,8260,15118,8223,15067,8143,15014,8014,14958,7873,14899,7723,14839,7573,14778,7430,14715,7293,14652,7164,14588,6931,14524,6720,14460,6531,14396,6362,14330,6210,14207,6015,14086,5781,13969,5576,15352,7114,15352,7116,15352,7128,15352,7159,15350,7195,15348,7237,15345,7299,15340,7374,15332,7457,15317,7544,15301,7633,15280,7703,15251,7754,15216,7775,15176,7767,15131,7733,15079,7670,15026,7588,14967,7492,14906,7387,14844,7278,14779,7171,14714,6965,14648,6770,14581,6587,14515,6420,14448,6269,14382,6123,14299,5881,14172,5665,14049,5477,13929,5310,15355,6329,15355,6330,15355,6339,15355,6362,15353,6410,15351,6472,15349,6572,15344,6688,15337,6835,15323,6985,15309,7142,15287,7220,15260,7277,15226,7310,15188,7326,15142,7318,15090,7285,15036,7239,14976,7177,14914,7045,14849,6892,14782,6736,14714,6581,14645,6433,14576,6293,14506,6164,14438,5946,14369,5733,14270,5540,14140,5369,14014,5216,13892,5043,15357,5483,15357,5484,15357,5496,15357,5528,15356,5597,15354,5692,15351,5835,15347,6011,15339,6195,15328,6317,15314,6446,15293,6566,15268,6668,15235,6746,15197,6796,15152,6811,15101,6790,15046,6748,14985,6673,14921,6583,14854,6479,14785,6371,14714,6259,14643,6149,14571,5946,14499,5750,14428,5567,14358,5401,14242,5250,14109,5111,13980,4870,13856,4657,15359,4555,15359,4557,15358,4573,15358,4633,15357,4715,15355,4841,15353,5061,15349,5216,15342,5391,15331,5577,15318,5770,15299,5967,15274,6150,15243,6223,15206,6280,15161,6310,15111,6317,15055,6300,14994,6262,14928,6208,14860,6141,14788,5994,14715,5838,14641,5684,14566,5529,14492,5384,14418,5247,14346,5121,14216,4892,14079,4682,13948,4496,13822,4330,15359,3498,15359,3501,15359,3520,15359,3598,15358,3719,15356,3860,15355,4137,15351,4305,15344,4563,15334,4809,15321,5116,15303,5273,15280,5418,15250,5547,15214,5653,15170,5722,15120,5761,15064,5763,15002,5733,14935,5673,14865,5597,14792,5504,14716,5400,14640,5294,14563,5185,14486,5041,14410,4841,14335,4655,14191,4482,14051,4325,13918,4183,13790,4012,15360,2282,15360,2285,15360,2306,15360,2401,15359,2547,15357,2748,15355,3103,15352,3349,15345,3675,15336,4020,15324,4272,15307,4496,15285,4716,15255,4908,15220,5086,15178,5170,15128,5214,15072,5234,15010,5231,14943,5206,14871,5166,14796,5102,14718,4971,14639,4833,14559,4687,14480,4541,14402,4401,14315,4268,14167,4142,14025,3958,13888,3747,13759,3556,15360,923,15360,925,15360,946,15360,1052,15359,1214,15357,1494,15356,1892,15352,2274,15346,2663,15338,3099,15326,3393,15309,3679,15288,3980,15260,4183,15226,4325,15185,4437,15136,4517,15080,4570,15018,4591,14950,4581,14877,4545,14800,4485,14720,4411,14638,4325,14556,4231,14475,4136,14395,3988,14297,3803,14145,3628,13999,3465,13861,3314,13729,3177,15360,263,15360,264,15360,272,15360,325,15359,407,15358,548,15356,780,15352,1144,15347,1580,15339,2099,15328,2425,15312,2795,15292,3133,15264,3329,15232,3517,15191,3689,15143,3819,15088,3923,15025,3978,14956,3999,14882,3979,14804,3931,14722,3855,14639,3756,14554,3645,14470,3529,14388,3409,14279,3289,14124,3173,13975,3055,13834,2848,13701,2658,15360,49,15360,49,15360,52,15360,75,15359,111,15358,201,15356,283,15353,519,15348,726,15340,1045,15329,1415,15314,1795,15295,2173,15269,2410,15237,2649,15197,2866,15150,3054,15095,3140,15032,3196,14963,3228,14888,3236,14808,3224,14725,3191,14639,3146,14553,3088,14466,2976,14382,2836,14262,2692,14103,2549,13952,2409,13808,2278,13674,2154,15360,4,15360,4,15360,4,15360,13,15359,33,15358,59,15357,112,15353,199,15348,302,15341,456,15331,628,15316,827,15297,1082,15272,1332,15241,1601,15202,1851,15156,2069,15101,2172,15039,2256,14970,2314,14894,2348,14813,2358,14728,2344,14640,2311,14551,2263,14463,2203,14376,2133,14247,2059,14084,1915,13930,1761,13784,1609,13648,1464,15360,0,15360,0,15360,0,15360,3,15359,18,15358,26,15357,53,15354,80,15348,97,15341,165,15332,238,15318,326,15299,427,15275,529,15245,654,15207,771,15161,885,15108,994,15046,1089,14976,1170,14900,1229,14817,1266,14731,1284,14641,1282,14550,1260,14460,1223,14370,1174,14232,1116,14066,1050,13909,981,13761,910,13623,839]);let Un=null;function C_(){return Un===null&&(Un=new ec(R_,32,32,Ya,ts),Un.minFilter=zt,Un.magFilter=zt,Un.wrapS=bn,Un.wrapT=bn,Un.generateMipmaps=!1,Un.needsUpdate=!0),Un}class $v{constructor(e={}){const{canvas:t=Ld(),context:n=null,depth:i=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:f=!1}=e;this.isWebGLRenderer=!0;let d;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");d=n.getContextAttributes().alpha}else d=o;const x=new Set([Ka,$a,qa]),y=new Set([Tn,mi,Ns,Us,Ha,Wa]),g=new Uint32Array(4),m=new Int32Array(4);let _=null,p=null;const v=[],T=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=ti,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const S=this;let w=!1;this._outputColorSpace=wt;let L=0,b=0,M=null,C=-1,D=null;const F=new ot,k=new ot;let z=null;const V=new Ve(0);let Y=0,G=t.width,ne=t.height,oe=1,Ae=null,je=null;const et=new ot(0,0,G,ne),rt=new ot(0,0,G,ne);let at=!1;const $=new nc;let J=!1,ye=!1;const De=new We,Re=new I,Je=new ot,pt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Be=!1;function Q(){return M===null?oe:1}let P=n;function Z(A,U){return t.getContext(A,U)}try{const A={alpha:!0,depth:i,stencil:r,antialias:a,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Va}`),t.addEventListener("webglcontextlost",se,!1),t.addEventListener("webglcontextrestored",K,!1),t.addEventListener("webglcontextcreationerror",Te,!1),P===null){const U="webgl2";if(P=Z(U,A),P===null)throw Z(U)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(A){throw A("WebGLRenderer: "+A.message),A}let re,ce,ie,be,de,ve,R,E,B,q,j,X,Ce,fe,Le,we,ee,le,Oe,Ue,ge,ke,N,me;function he(){re=new Bx(P),re.init(),ke=new y_(P,re),ce=new Cx(P,re,e,ke),ie=new __(P,re),ce.reversedDepthBuffer&&f&&ie.buffers.depth.setReversed(!0),be=new Vx(P),de=new r_,ve=new v_(P,re,ie,de,ce,ke,be),R=new Lx(S),E=new Ox(S),B=new Xp(P),N=new wx(P,B),q=new zx(P,B,be,N),j=new Hx(P,q,B,be),Oe=new Gx(P,ce,ve),we=new Px(de),X=new s_(S,R,E,re,ce,N,we),Ce=new A_(S,de),fe=new a_,Le=new f_(re),le=new Ax(S,R,E,ie,j,d,c),ee=new x_(S,j,ce),me=new w_(P,be,ce,ie),Ue=new Rx(P,re,be),ge=new kx(P,re,be),be.programs=X.programs,S.capabilities=ce,S.extensions=re,S.properties=de,S.renderLists=fe,S.shadowMap=ee,S.state=ie,S.info=be}he();const ue=new T_(S,P);this.xr=ue,this.getContext=function(){return P},this.getContextAttributes=function(){return P.getContextAttributes()},this.forceContextLoss=function(){const A=re.get("WEBGL_lose_context");A&&A.loseContext()},this.forceContextRestore=function(){const A=re.get("WEBGL_lose_context");A&&A.restoreContext()},this.getPixelRatio=function(){return oe},this.setPixelRatio=function(A){A!==void 0&&(oe=A,this.setSize(G,ne,!1))},this.getSize=function(A){return A.set(G,ne)},this.setSize=function(A,U,H=!0){if(ue.isPresenting){Pe("WebGLRenderer: Can't change size while VR device is presenting.");return}G=A,ne=U,t.width=Math.floor(A*oe),t.height=Math.floor(U*oe),H===!0&&(t.style.width=A+"px",t.style.height=U+"px"),this.setViewport(0,0,A,U)},this.getDrawingBufferSize=function(A){return A.set(G*oe,ne*oe).floor()},this.setDrawingBufferSize=function(A,U,H){G=A,ne=U,oe=H,t.width=Math.floor(A*H),t.height=Math.floor(U*H),this.setViewport(0,0,A,U)},this.getCurrentViewport=function(A){return A.copy(F)},this.getViewport=function(A){return A.copy(et)},this.setViewport=function(A,U,H,W){A.isVector4?et.set(A.x,A.y,A.z,A.w):et.set(A,U,H,W),ie.viewport(F.copy(et).multiplyScalar(oe).round())},this.getScissor=function(A){return A.copy(rt)},this.setScissor=function(A,U,H,W){A.isVector4?rt.set(A.x,A.y,A.z,A.w):rt.set(A,U,H,W),ie.scissor(k.copy(rt).multiplyScalar(oe).round())},this.getScissorTest=function(){return at},this.setScissorTest=function(A){ie.setScissorTest(at=A)},this.setOpaqueSort=function(A){Ae=A},this.setTransparentSort=function(A){je=A},this.getClearColor=function(A){return A.copy(le.getClearColor())},this.setClearColor=function(){le.setClearColor(...arguments)},this.getClearAlpha=function(){return le.getClearAlpha()},this.setClearAlpha=function(){le.setClearAlpha(...arguments)},this.clear=function(A=!0,U=!0,H=!0){let W=0;if(A){let O=!1;if(M!==null){const ae=M.texture.format;O=x.has(ae)}if(O){const ae=M.texture.type,xe=y.has(ae),Ee=le.getClearColor(),Me=le.getClearAlpha(),Fe=Ee.r,ze=Ee.g,Ie=Ee.b;xe?(g[0]=Fe,g[1]=ze,g[2]=Ie,g[3]=Me,P.clearBufferuiv(P.COLOR,0,g)):(m[0]=Fe,m[1]=ze,m[2]=Ie,m[3]=Me,P.clearBufferiv(P.COLOR,0,m))}else W|=P.COLOR_BUFFER_BIT}U&&(W|=P.DEPTH_BUFFER_BIT),H&&(W|=P.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),P.clear(W)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",se,!1),t.removeEventListener("webglcontextrestored",K,!1),t.removeEventListener("webglcontextcreationerror",Te,!1),le.dispose(),fe.dispose(),Le.dispose(),de.dispose(),R.dispose(),E.dispose(),j.dispose(),N.dispose(),me.dispose(),X.dispose(),ue.dispose(),ue.removeEventListener("sessionstart",dc),ue.removeEventListener("sessionend",fc),ii.stop()};function se(A){A.preventDefault(),zr("WebGLRenderer: Context Lost."),w=!0}function K(){zr("WebGLRenderer: Context Restored."),w=!1;const A=be.autoReset,U=ee.enabled,H=ee.autoUpdate,W=ee.needsUpdate,O=ee.type;he(),be.autoReset=A,ee.enabled=U,ee.autoUpdate=H,ee.needsUpdate=W,ee.type=O}function Te(A){$e("WebGLRenderer: A WebGL context could not be created. Reason: ",A.statusMessage)}function He(A){const U=A.target;U.removeEventListener("dispose",He),xt(U)}function xt(A){ht(A),de.remove(A)}function ht(A){const U=de.get(A).programs;U!==void 0&&(U.forEach(function(H){X.releaseProgram(H)}),A.isShaderMaterial&&X.releaseShaderCache(A))}this.renderBufferDirect=function(A,U,H,W,O,ae){U===null&&(U=pt);const xe=O.isMesh&&O.matrixWorld.determinant()<0,Ee=bu(A,U,H,W,O);ie.setMaterial(W,xe);let Me=H.index,Fe=1;if(W.wireframe===!0){if(Me=q.getWireframeAttribute(H),Me===void 0)return;Fe=2}const ze=H.drawRange,Ie=H.attributes.position;let tt=ze.start*Fe,ut=(ze.start+ze.count)*Fe;ae!==null&&(tt=Math.max(tt,ae.start*Fe),ut=Math.min(ut,(ae.start+ae.count)*Fe)),Me!==null?(tt=Math.max(tt,0),ut=Math.min(ut,Me.count)):Ie!=null&&(tt=Math.max(tt,0),ut=Math.min(ut,Ie.count));const bt=ut-tt;if(bt<0||bt===1/0)return;N.setup(O,W,Ee,H,Me);let St,mt=Ue;if(Me!==null&&(St=B.get(Me),mt=ge,mt.setIndex(St)),O.isMesh)W.wireframe===!0?(ie.setLineWidth(W.wireframeLinewidth*Q()),mt.setMode(P.LINES)):mt.setMode(P.TRIANGLES);else if(O.isLine){let Ne=W.linewidth;Ne===void 0&&(Ne=1),ie.setLineWidth(Ne*Q()),O.isLineSegments?mt.setMode(P.LINES):O.isLineLoop?mt.setMode(P.LINE_LOOP):mt.setMode(P.LINE_STRIP)}else O.isPoints?mt.setMode(P.POINTS):O.isSprite&&mt.setMode(P.TRIANGLES);if(O.isBatchedMesh)if(O._multiDrawInstances!==null)Vs("WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),mt.renderMultiDrawInstances(O._multiDrawStarts,O._multiDrawCounts,O._multiDrawCount,O._multiDrawInstances);else if(re.get("WEBGL_multi_draw"))mt.renderMultiDraw(O._multiDrawStarts,O._multiDrawCounts,O._multiDrawCount);else{const Ne=O._multiDrawStarts,vt=O._multiDrawCounts,st=O._multiDrawCount,$t=Me?B.get(Me).bytesPerElement:1,_i=de.get(W).currentProgram.getUniforms();for(let Kt=0;Kt<st;Kt++)_i.setValue(P,"_gl_DrawID",Kt),mt.render(Ne[Kt]/$t,vt[Kt])}else if(O.isInstancedMesh)mt.renderInstances(tt,bt,O.count);else if(H.isInstancedBufferGeometry){const Ne=H._maxInstanceCount!==void 0?H._maxInstanceCount:1/0,vt=Math.min(H.instanceCount,Ne);mt.renderInstances(tt,bt,vt)}else mt.render(tt,bt)};function _n(A,U,H){A.transparent===!0&&A.side===Et&&A.forceSinglePass===!1?(A.side=qt,A.needsUpdate=!0,Ks(A,U,H),A.side=Gn,A.needsUpdate=!0,Ks(A,U,H),A.side=Et):Ks(A,U,H)}this.compile=function(A,U,H=null){H===null&&(H=A),p=Le.get(H),p.init(U),T.push(p),H.traverseVisible(function(O){O.isLight&&O.layers.test(U.layers)&&(p.pushLight(O),O.castShadow&&p.pushShadow(O))}),A!==H&&A.traverseVisible(function(O){O.isLight&&O.layers.test(U.layers)&&(p.pushLight(O),O.castShadow&&p.pushShadow(O))}),p.setupLights();const W=new Set;return A.traverse(function(O){if(!(O.isMesh||O.isPoints||O.isLine||O.isSprite))return;const ae=O.material;if(ae)if(Array.isArray(ae))for(let xe=0;xe<ae.length;xe++){const Ee=ae[xe];_n(Ee,H,O),W.add(Ee)}else _n(ae,H,O),W.add(ae)}),p=T.pop(),W},this.compileAsync=function(A,U,H=null){const W=this.compile(A,U,H);return new Promise(O=>{function ae(){if(W.forEach(function(xe){de.get(xe).currentProgram.isReady()&&W.delete(xe)}),W.size===0){O(A);return}setTimeout(ae,10)}re.get("KHR_parallel_shader_compile")!==null?ae():setTimeout(ae,10)})};let ln=null;function Mu(A){ln&&ln(A)}function dc(){ii.stop()}function fc(){ii.start()}const ii=new ru;ii.setAnimationLoop(Mu),typeof self<"u"&&ii.setContext(self),this.setAnimationLoop=function(A){ln=A,ue.setAnimationLoop(A),A===null?ii.stop():ii.start()},ue.addEventListener("sessionstart",dc),ue.addEventListener("sessionend",fc),this.render=function(A,U){if(U!==void 0&&U.isCamera!==!0){$e("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(w===!0)return;if(A.matrixWorldAutoUpdate===!0&&A.updateMatrixWorld(),U.parent===null&&U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),ue.enabled===!0&&ue.isPresenting===!0&&(ue.cameraAutoUpdate===!0&&ue.updateCamera(U),U=ue.getCamera()),A.isScene===!0&&A.onBeforeRender(S,A,U,M),p=Le.get(A,T.length),p.init(U),T.push(p),De.multiplyMatrices(U.projectionMatrix,U.matrixWorldInverse),$.setFromProjectionMatrix(De,Sn,U.reversedDepth),ye=this.localClippingEnabled,J=we.init(this.clippingPlanes,ye),_=fe.get(A,v.length),_.init(),v.push(_),ue.enabled===!0&&ue.isPresenting===!0){const ae=S.xr.getDepthSensingMesh();ae!==null&&Jr(ae,U,-1/0,S.sortObjects)}Jr(A,U,0,S.sortObjects),_.finish(),S.sortObjects===!0&&_.sort(Ae,je),Be=ue.enabled===!1||ue.isPresenting===!1||ue.hasDepthSensing()===!1,Be&&le.addToRenderList(_,A),this.info.render.frame++,J===!0&&we.beginShadows();const H=p.state.shadowsArray;ee.render(H,A,U),J===!0&&we.endShadows(),this.info.autoReset===!0&&this.info.reset();const W=_.opaque,O=_.transmissive;if(p.setupLights(),U.isArrayCamera){const ae=U.cameras;if(O.length>0)for(let xe=0,Ee=ae.length;xe<Ee;xe++){const Me=ae[xe];mc(W,O,A,Me)}Be&&le.render(A);for(let xe=0,Ee=ae.length;xe<Ee;xe++){const Me=ae[xe];pc(_,A,Me,Me.viewport)}}else O.length>0&&mc(W,O,A,U),Be&&le.render(A),pc(_,A,U);M!==null&&b===0&&(ve.updateMultisampleRenderTarget(M),ve.updateRenderTargetMipmap(M)),A.isScene===!0&&A.onAfterRender(S,A,U),N.resetDefaultState(),C=-1,D=null,T.pop(),T.length>0?(p=T[T.length-1],J===!0&&we.setGlobalState(S.clippingPlanes,p.state.camera)):p=null,v.pop(),v.length>0?_=v[v.length-1]:_=null};function Jr(A,U,H,W){if(A.visible===!1)return;if(A.layers.test(U.layers)){if(A.isGroup)H=A.renderOrder;else if(A.isLOD)A.autoUpdate===!0&&A.update(U);else if(A.isLight)p.pushLight(A),A.castShadow&&p.pushShadow(A);else if(A.isSprite){if(!A.frustumCulled||$.intersectsSprite(A)){W&&Je.setFromMatrixPosition(A.matrixWorld).applyMatrix4(De);const xe=j.update(A),Ee=A.material;Ee.visible&&_.push(A,xe,Ee,H,Je.z,null)}}else if((A.isMesh||A.isLine||A.isPoints)&&(!A.frustumCulled||$.intersectsObject(A))){const xe=j.update(A),Ee=A.material;if(W&&(A.boundingSphere!==void 0?(A.boundingSphere===null&&A.computeBoundingSphere(),Je.copy(A.boundingSphere.center)):(xe.boundingSphere===null&&xe.computeBoundingSphere(),Je.copy(xe.boundingSphere.center)),Je.applyMatrix4(A.matrixWorld).applyMatrix4(De)),Array.isArray(Ee)){const Me=xe.groups;for(let Fe=0,ze=Me.length;Fe<ze;Fe++){const Ie=Me[Fe],tt=Ee[Ie.materialIndex];tt&&tt.visible&&_.push(A,xe,tt,H,Je.z,Ie)}}else Ee.visible&&_.push(A,xe,Ee,H,Je.z,null)}}const ae=A.children;for(let xe=0,Ee=ae.length;xe<Ee;xe++)Jr(ae[xe],U,H,W)}function pc(A,U,H,W){const{opaque:O,transmissive:ae,transparent:xe}=A;p.setupLightsView(H),J===!0&&we.setGlobalState(S.clippingPlanes,H),W&&ie.viewport(F.copy(W)),O.length>0&&$s(O,U,H),ae.length>0&&$s(ae,U,H),xe.length>0&&$s(xe,U,H),ie.buffers.depth.setTest(!0),ie.buffers.depth.setMask(!0),ie.buffers.color.setMask(!0),ie.setPolygonOffset(!1)}function mc(A,U,H,W){if((H.isScene===!0?H.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[W.id]===void 0&&(p.state.transmissionRenderTarget[W.id]=new xi(1,1,{generateMipmaps:!0,type:re.has("EXT_color_buffer_half_float")||re.has("EXT_color_buffer_float")?ts:Tn,minFilter:On,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:nt.workingColorSpace}));const ae=p.state.transmissionRenderTarget[W.id],xe=W.viewport||F;ae.setSize(xe.z*S.transmissionResolutionScale,xe.w*S.transmissionResolutionScale);const Ee=S.getRenderTarget(),Me=S.getActiveCubeFace(),Fe=S.getActiveMipmapLevel();S.setRenderTarget(ae),S.getClearColor(V),Y=S.getClearAlpha(),Y<1&&S.setClearColor(16777215,.5),S.clear(),Be&&le.render(H);const ze=S.toneMapping;S.toneMapping=ti;const Ie=W.viewport;if(W.viewport!==void 0&&(W.viewport=void 0),p.setupLightsView(W),J===!0&&we.setGlobalState(S.clippingPlanes,W),$s(A,H,W),ve.updateMultisampleRenderTarget(ae),ve.updateRenderTargetMipmap(ae),re.has("WEBGL_multisampled_render_to_texture")===!1){let tt=!1;for(let ut=0,bt=U.length;ut<bt;ut++){const St=U[ut],{object:mt,geometry:Ne,material:vt,group:st}=St;if(vt.side===Et&&mt.layers.test(W.layers)){const $t=vt.side;vt.side=qt,vt.needsUpdate=!0,xc(mt,H,W,Ne,vt,st),vt.side=$t,vt.needsUpdate=!0,tt=!0}}tt===!0&&(ve.updateMultisampleRenderTarget(ae),ve.updateRenderTargetMipmap(ae))}S.setRenderTarget(Ee,Me,Fe),S.setClearColor(V,Y),Ie!==void 0&&(W.viewport=Ie),S.toneMapping=ze}function $s(A,U,H){const W=U.isScene===!0?U.overrideMaterial:null;for(let O=0,ae=A.length;O<ae;O++){const xe=A[O],{object:Ee,geometry:Me,group:Fe}=xe;let ze=xe.material;ze.allowOverride===!0&&W!==null&&(ze=W),Ee.layers.test(H.layers)&&xc(Ee,U,H,Me,ze,Fe)}}function xc(A,U,H,W,O,ae){A.onBeforeRender(S,U,H,W,O,ae),A.modelViewMatrix.multiplyMatrices(H.matrixWorldInverse,A.matrixWorld),A.normalMatrix.getNormalMatrix(A.modelViewMatrix),O.onBeforeRender(S,U,H,W,A,ae),O.transparent===!0&&O.side===Et&&O.forceSinglePass===!1?(O.side=qt,O.needsUpdate=!0,S.renderBufferDirect(H,U,W,O,A,ae),O.side=Gn,O.needsUpdate=!0,S.renderBufferDirect(H,U,W,O,A,ae),O.side=Et):S.renderBufferDirect(H,U,W,O,A,ae),A.onAfterRender(S,U,H,W,O,ae)}function Ks(A,U,H){U.isScene!==!0&&(U=pt);const W=de.get(A),O=p.state.lights,ae=p.state.shadowsArray,xe=O.state.version,Ee=X.getParameters(A,O.state,ae,U,H),Me=X.getProgramCacheKey(Ee);let Fe=W.programs;W.environment=A.isMeshStandardMaterial?U.environment:null,W.fog=U.fog,W.envMap=(A.isMeshStandardMaterial?E:R).get(A.envMap||W.environment),W.envMapRotation=W.environment!==null&&A.envMap===null?U.environmentRotation:A.envMapRotation,Fe===void 0&&(A.addEventListener("dispose",He),Fe=new Map,W.programs=Fe);let ze=Fe.get(Me);if(ze!==void 0){if(W.currentProgram===ze&&W.lightsStateVersion===xe)return _c(A,Ee),ze}else Ee.uniforms=X.getUniforms(A),A.onBeforeCompile(Ee,S),ze=X.acquireProgram(Ee,Me),Fe.set(Me,ze),W.uniforms=Ee.uniforms;const Ie=W.uniforms;return(!A.isShaderMaterial&&!A.isRawShaderMaterial||A.clipping===!0)&&(Ie.clippingPlanes=we.uniform),_c(A,Ee),W.needsLights=Tu(A),W.lightsStateVersion=xe,W.needsLights&&(Ie.ambientLightColor.value=O.state.ambient,Ie.lightProbe.value=O.state.probe,Ie.directionalLights.value=O.state.directional,Ie.directionalLightShadows.value=O.state.directionalShadow,Ie.spotLights.value=O.state.spot,Ie.spotLightShadows.value=O.state.spotShadow,Ie.rectAreaLights.value=O.state.rectArea,Ie.ltc_1.value=O.state.rectAreaLTC1,Ie.ltc_2.value=O.state.rectAreaLTC2,Ie.pointLights.value=O.state.point,Ie.pointLightShadows.value=O.state.pointShadow,Ie.hemisphereLights.value=O.state.hemi,Ie.directionalShadowMap.value=O.state.directionalShadowMap,Ie.directionalShadowMatrix.value=O.state.directionalShadowMatrix,Ie.spotShadowMap.value=O.state.spotShadowMap,Ie.spotLightMatrix.value=O.state.spotLightMatrix,Ie.spotLightMap.value=O.state.spotLightMap,Ie.pointShadowMap.value=O.state.pointShadowMap,Ie.pointShadowMatrix.value=O.state.pointShadowMatrix),W.currentProgram=ze,W.uniformsList=null,ze}function gc(A){if(A.uniformsList===null){const U=A.currentProgram.getUniforms();A.uniformsList=Ur.seqWithValue(U.seq,A.uniforms)}return A.uniformsList}function _c(A,U){const H=de.get(A);H.outputColorSpace=U.outputColorSpace,H.batching=U.batching,H.batchingColor=U.batchingColor,H.instancing=U.instancing,H.instancingColor=U.instancingColor,H.instancingMorph=U.instancingMorph,H.skinning=U.skinning,H.morphTargets=U.morphTargets,H.morphNormals=U.morphNormals,H.morphColors=U.morphColors,H.morphTargetsCount=U.morphTargetsCount,H.numClippingPlanes=U.numClippingPlanes,H.numIntersection=U.numClipIntersection,H.vertexAlphas=U.vertexAlphas,H.vertexTangents=U.vertexTangents,H.toneMapping=U.toneMapping}function bu(A,U,H,W,O){U.isScene!==!0&&(U=pt),ve.resetTextureUnits();const ae=U.fog,xe=W.isMeshStandardMaterial?U.environment:null,Ee=M===null?S.outputColorSpace:M.isXRRenderTarget===!0?M.texture.colorSpace:Gt,Me=(W.isMeshStandardMaterial?E:R).get(W.envMap||xe),Fe=W.vertexColors===!0&&!!H.attributes.color&&H.attributes.color.itemSize===4,ze=!!H.attributes.tangent&&(!!W.normalMap||W.anisotropy>0),Ie=!!H.morphAttributes.position,tt=!!H.morphAttributes.normal,ut=!!H.morphAttributes.color;let bt=ti;W.toneMapped&&(M===null||M.isXRRenderTarget===!0)&&(bt=S.toneMapping);const St=H.morphAttributes.position||H.morphAttributes.normal||H.morphAttributes.color,mt=St!==void 0?St.length:0,Ne=de.get(W),vt=p.state.lights;if(J===!0&&(ye===!0||A!==D)){const Ft=A===D&&W.id===C;we.setState(W,A,Ft)}let st=!1;W.version===Ne.__version?(Ne.needsLights&&Ne.lightsStateVersion!==vt.state.version||Ne.outputColorSpace!==Ee||O.isBatchedMesh&&Ne.batching===!1||!O.isBatchedMesh&&Ne.batching===!0||O.isBatchedMesh&&Ne.batchingColor===!0&&O.colorTexture===null||O.isBatchedMesh&&Ne.batchingColor===!1&&O.colorTexture!==null||O.isInstancedMesh&&Ne.instancing===!1||!O.isInstancedMesh&&Ne.instancing===!0||O.isSkinnedMesh&&Ne.skinning===!1||!O.isSkinnedMesh&&Ne.skinning===!0||O.isInstancedMesh&&Ne.instancingColor===!0&&O.instanceColor===null||O.isInstancedMesh&&Ne.instancingColor===!1&&O.instanceColor!==null||O.isInstancedMesh&&Ne.instancingMorph===!0&&O.morphTexture===null||O.isInstancedMesh&&Ne.instancingMorph===!1&&O.morphTexture!==null||Ne.envMap!==Me||W.fog===!0&&Ne.fog!==ae||Ne.numClippingPlanes!==void 0&&(Ne.numClippingPlanes!==we.numPlanes||Ne.numIntersection!==we.numIntersection)||Ne.vertexAlphas!==Fe||Ne.vertexTangents!==ze||Ne.morphTargets!==Ie||Ne.morphNormals!==tt||Ne.morphColors!==ut||Ne.toneMapping!==bt||Ne.morphTargetsCount!==mt)&&(st=!0):(st=!0,Ne.__version=W.version);let $t=Ne.currentProgram;st===!0&&($t=Ks(W,U,O));let _i=!1,Kt=!1,as=!1;const yt=$t.getUniforms(),Ht=Ne.uniforms;if(ie.useProgram($t.program)&&(_i=!0,Kt=!0,as=!0),W.id!==C&&(C=W.id,Kt=!0),_i||D!==A){ie.buffers.depth.getReversed()&&A.reversedDepth!==!0&&(A._reversedDepth=!0,A.updateProjectionMatrix()),yt.setValue(P,"projectionMatrix",A.projectionMatrix),yt.setValue(P,"viewMatrix",A.matrixWorldInverse);const Wt=yt.map.cameraPosition;Wt!==void 0&&Wt.setValue(P,Re.setFromMatrixPosition(A.matrixWorld)),ce.logarithmicDepthBuffer&&yt.setValue(P,"logDepthBufFC",2/(Math.log(A.far+1)/Math.LN2)),(W.isMeshPhongMaterial||W.isMeshToonMaterial||W.isMeshLambertMaterial||W.isMeshBasicMaterial||W.isMeshStandardMaterial||W.isShaderMaterial)&&yt.setValue(P,"isOrthographic",A.isOrthographicCamera===!0),D!==A&&(D=A,Kt=!0,as=!0)}if(O.isSkinnedMesh){yt.setOptional(P,O,"bindMatrix"),yt.setOptional(P,O,"bindMatrixInverse");const Ft=O.skeleton;Ft&&(Ft.boneTexture===null&&Ft.computeBoneTexture(),yt.setValue(P,"boneTexture",Ft.boneTexture,ve))}O.isBatchedMesh&&(yt.setOptional(P,O,"batchingTexture"),yt.setValue(P,"batchingTexture",O._matricesTexture,ve),yt.setOptional(P,O,"batchingIdTexture"),yt.setValue(P,"batchingIdTexture",O._indirectTexture,ve),yt.setOptional(P,O,"batchingColorTexture"),O._colorsTexture!==null&&yt.setValue(P,"batchingColorTexture",O._colorsTexture,ve));const Qt=H.morphAttributes;if((Qt.position!==void 0||Qt.normal!==void 0||Qt.color!==void 0)&&Oe.update(O,H,$t),(Kt||Ne.receiveShadow!==O.receiveShadow)&&(Ne.receiveShadow=O.receiveShadow,yt.setValue(P,"receiveShadow",O.receiveShadow)),W.isMeshGouraudMaterial&&W.envMap!==null&&(Ht.envMap.value=Me,Ht.flipEnvMap.value=Me.isCubeTexture&&Me.isRenderTargetTexture===!1?-1:1),W.isMeshStandardMaterial&&W.envMap===null&&U.environment!==null&&(Ht.envMapIntensity.value=U.environmentIntensity),Ht.dfgLUT!==void 0&&(Ht.dfgLUT.value=C_()),Kt&&(yt.setValue(P,"toneMappingExposure",S.toneMappingExposure),Ne.needsLights&&Su(Ht,as),ae&&W.fog===!0&&Ce.refreshFogUniforms(Ht,ae),Ce.refreshMaterialUniforms(Ht,W,oe,ne,p.state.transmissionRenderTarget[A.id]),Ur.upload(P,gc(Ne),Ht,ve)),W.isShaderMaterial&&W.uniformsNeedUpdate===!0&&(Ur.upload(P,gc(Ne),Ht,ve),W.uniformsNeedUpdate=!1),W.isSpriteMaterial&&yt.setValue(P,"center",O.center),yt.setValue(P,"modelViewMatrix",O.modelViewMatrix),yt.setValue(P,"normalMatrix",O.normalMatrix),yt.setValue(P,"modelMatrix",O.matrixWorld),W.isShaderMaterial||W.isRawShaderMaterial){const Ft=W.uniformsGroups;for(let Wt=0,Zr=Ft.length;Wt<Zr;Wt++){const si=Ft[Wt];me.update(si,$t),me.bind(si,$t)}}return $t}function Su(A,U){A.ambientLightColor.needsUpdate=U,A.lightProbe.needsUpdate=U,A.directionalLights.needsUpdate=U,A.directionalLightShadows.needsUpdate=U,A.pointLights.needsUpdate=U,A.pointLightShadows.needsUpdate=U,A.spotLights.needsUpdate=U,A.spotLightShadows.needsUpdate=U,A.rectAreaLights.needsUpdate=U,A.hemisphereLights.needsUpdate=U}function Tu(A){return A.isMeshLambertMaterial||A.isMeshToonMaterial||A.isMeshPhongMaterial||A.isMeshStandardMaterial||A.isShadowMaterial||A.isShaderMaterial&&A.lights===!0}this.getActiveCubeFace=function(){return L},this.getActiveMipmapLevel=function(){return b},this.getRenderTarget=function(){return M},this.setRenderTargetTextures=function(A,U,H){const W=de.get(A);W.__autoAllocateDepthBuffer=A.resolveDepthBuffer===!1,W.__autoAllocateDepthBuffer===!1&&(W.__useRenderToTexture=!1),de.get(A.texture).__webglTexture=U,de.get(A.depthTexture).__webglTexture=W.__autoAllocateDepthBuffer?void 0:H,W.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(A,U){const H=de.get(A);H.__webglFramebuffer=U,H.__useDefaultFramebuffer=U===void 0};const Eu=P.createFramebuffer();this.setRenderTarget=function(A,U=0,H=0){M=A,L=U,b=H;let W=!0,O=null,ae=!1,xe=!1;if(A){const Me=de.get(A);if(Me.__useDefaultFramebuffer!==void 0)ie.bindFramebuffer(P.FRAMEBUFFER,null),W=!1;else if(Me.__webglFramebuffer===void 0)ve.setupRenderTarget(A);else if(Me.__hasExternalTextures)ve.rebindTextures(A,de.get(A.texture).__webglTexture,de.get(A.depthTexture).__webglTexture);else if(A.depthBuffer){const Ie=A.depthTexture;if(Me.__boundDepthTexture!==Ie){if(Ie!==null&&de.has(Ie)&&(A.width!==Ie.image.width||A.height!==Ie.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");ve.setupDepthRenderbuffer(A)}}const Fe=A.texture;(Fe.isData3DTexture||Fe.isDataArrayTexture||Fe.isCompressedArrayTexture)&&(xe=!0);const ze=de.get(A).__webglFramebuffer;A.isWebGLCubeRenderTarget?(Array.isArray(ze[U])?O=ze[U][H]:O=ze[U],ae=!0):A.samples>0&&ve.useMultisampledRTT(A)===!1?O=de.get(A).__webglMultisampledFramebuffer:Array.isArray(ze)?O=ze[H]:O=ze,F.copy(A.viewport),k.copy(A.scissor),z=A.scissorTest}else F.copy(et).multiplyScalar(oe).floor(),k.copy(rt).multiplyScalar(oe).floor(),z=at;if(H!==0&&(O=Eu),ie.bindFramebuffer(P.FRAMEBUFFER,O)&&W&&ie.drawBuffers(A,O),ie.viewport(F),ie.scissor(k),ie.setScissorTest(z),ae){const Me=de.get(A.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_CUBE_MAP_POSITIVE_X+U,Me.__webglTexture,H)}else if(xe){const Me=U;for(let Fe=0;Fe<A.textures.length;Fe++){const ze=de.get(A.textures[Fe]);P.framebufferTextureLayer(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0+Fe,ze.__webglTexture,H,Me)}}else if(A!==null&&H!==0){const Me=de.get(A.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,Me.__webglTexture,H)}C=-1},this.readRenderTargetPixels=function(A,U,H,W,O,ae,xe,Ee=0){if(!(A&&A.isWebGLRenderTarget)){$e("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Me=de.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&xe!==void 0&&(Me=Me[xe]),Me){ie.bindFramebuffer(P.FRAMEBUFFER,Me);try{const Fe=A.textures[Ee],ze=Fe.format,Ie=Fe.type;if(!ce.textureFormatReadable(ze)){$e("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!ce.textureTypeReadable(Ie)){$e("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}U>=0&&U<=A.width-W&&H>=0&&H<=A.height-O&&(A.textures.length>1&&P.readBuffer(P.COLOR_ATTACHMENT0+Ee),P.readPixels(U,H,W,O,ke.convert(ze),ke.convert(Ie),ae))}finally{const Fe=M!==null?de.get(M).__webglFramebuffer:null;ie.bindFramebuffer(P.FRAMEBUFFER,Fe)}}},this.readRenderTargetPixelsAsync=async function(A,U,H,W,O,ae,xe,Ee=0){if(!(A&&A.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Me=de.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&xe!==void 0&&(Me=Me[xe]),Me)if(U>=0&&U<=A.width-W&&H>=0&&H<=A.height-O){ie.bindFramebuffer(P.FRAMEBUFFER,Me);const Fe=A.textures[Ee],ze=Fe.format,Ie=Fe.type;if(!ce.textureFormatReadable(ze))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!ce.textureTypeReadable(Ie))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const tt=P.createBuffer();P.bindBuffer(P.PIXEL_PACK_BUFFER,tt),P.bufferData(P.PIXEL_PACK_BUFFER,ae.byteLength,P.STREAM_READ),A.textures.length>1&&P.readBuffer(P.COLOR_ATTACHMENT0+Ee),P.readPixels(U,H,W,O,ke.convert(ze),ke.convert(Ie),0);const ut=M!==null?de.get(M).__webglFramebuffer:null;ie.bindFramebuffer(P.FRAMEBUFFER,ut);const bt=P.fenceSync(P.SYNC_GPU_COMMANDS_COMPLETE,0);return P.flush(),await Id(P,bt,4),P.bindBuffer(P.PIXEL_PACK_BUFFER,tt),P.getBufferSubData(P.PIXEL_PACK_BUFFER,0,ae),P.deleteBuffer(tt),P.deleteSync(bt),ae}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(A,U=null,H=0){const W=Math.pow(2,-H),O=Math.floor(A.image.width*W),ae=Math.floor(A.image.height*W),xe=U!==null?U.x:0,Ee=U!==null?U.y:0;ve.setTexture2D(A,0),P.copyTexSubImage2D(P.TEXTURE_2D,H,0,0,xe,Ee,O,ae),ie.unbindTexture()};const Au=P.createFramebuffer(),wu=P.createFramebuffer();this.copyTextureToTexture=function(A,U,H=null,W=null,O=0,ae=null){ae===null&&(O!==0?(Vs("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),ae=O,O=0):ae=0);let xe,Ee,Me,Fe,ze,Ie,tt,ut,bt;const St=A.isCompressedTexture?A.mipmaps[ae]:A.image;if(H!==null)xe=H.max.x-H.min.x,Ee=H.max.y-H.min.y,Me=H.isBox3?H.max.z-H.min.z:1,Fe=H.min.x,ze=H.min.y,Ie=H.isBox3?H.min.z:0;else{const Qt=Math.pow(2,-O);xe=Math.floor(St.width*Qt),Ee=Math.floor(St.height*Qt),A.isDataArrayTexture?Me=St.depth:A.isData3DTexture?Me=Math.floor(St.depth*Qt):Me=1,Fe=0,ze=0,Ie=0}W!==null?(tt=W.x,ut=W.y,bt=W.z):(tt=0,ut=0,bt=0);const mt=ke.convert(U.format),Ne=ke.convert(U.type);let vt;U.isData3DTexture?(ve.setTexture3D(U,0),vt=P.TEXTURE_3D):U.isDataArrayTexture||U.isCompressedArrayTexture?(ve.setTexture2DArray(U,0),vt=P.TEXTURE_2D_ARRAY):(ve.setTexture2D(U,0),vt=P.TEXTURE_2D),P.pixelStorei(P.UNPACK_FLIP_Y_WEBGL,U.flipY),P.pixelStorei(P.UNPACK_PREMULTIPLY_ALPHA_WEBGL,U.premultiplyAlpha),P.pixelStorei(P.UNPACK_ALIGNMENT,U.unpackAlignment);const st=P.getParameter(P.UNPACK_ROW_LENGTH),$t=P.getParameter(P.UNPACK_IMAGE_HEIGHT),_i=P.getParameter(P.UNPACK_SKIP_PIXELS),Kt=P.getParameter(P.UNPACK_SKIP_ROWS),as=P.getParameter(P.UNPACK_SKIP_IMAGES);P.pixelStorei(P.UNPACK_ROW_LENGTH,St.width),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,St.height),P.pixelStorei(P.UNPACK_SKIP_PIXELS,Fe),P.pixelStorei(P.UNPACK_SKIP_ROWS,ze),P.pixelStorei(P.UNPACK_SKIP_IMAGES,Ie);const yt=A.isDataArrayTexture||A.isData3DTexture,Ht=U.isDataArrayTexture||U.isData3DTexture;if(A.isDepthTexture){const Qt=de.get(A),Ft=de.get(U),Wt=de.get(Qt.__renderTarget),Zr=de.get(Ft.__renderTarget);ie.bindFramebuffer(P.READ_FRAMEBUFFER,Wt.__webglFramebuffer),ie.bindFramebuffer(P.DRAW_FRAMEBUFFER,Zr.__webglFramebuffer);for(let si=0;si<Me;si++)yt&&(P.framebufferTextureLayer(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,de.get(A).__webglTexture,O,Ie+si),P.framebufferTextureLayer(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,de.get(U).__webglTexture,ae,bt+si)),P.blitFramebuffer(Fe,ze,xe,Ee,tt,ut,xe,Ee,P.DEPTH_BUFFER_BIT,P.NEAREST);ie.bindFramebuffer(P.READ_FRAMEBUFFER,null),ie.bindFramebuffer(P.DRAW_FRAMEBUFFER,null)}else if(O!==0||A.isRenderTargetTexture||de.has(A)){const Qt=de.get(A),Ft=de.get(U);ie.bindFramebuffer(P.READ_FRAMEBUFFER,Au),ie.bindFramebuffer(P.DRAW_FRAMEBUFFER,wu);for(let Wt=0;Wt<Me;Wt++)yt?P.framebufferTextureLayer(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,Qt.__webglTexture,O,Ie+Wt):P.framebufferTexture2D(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,Qt.__webglTexture,O),Ht?P.framebufferTextureLayer(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,Ft.__webglTexture,ae,bt+Wt):P.framebufferTexture2D(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,Ft.__webglTexture,ae),O!==0?P.blitFramebuffer(Fe,ze,xe,Ee,tt,ut,xe,Ee,P.COLOR_BUFFER_BIT,P.NEAREST):Ht?P.copyTexSubImage3D(vt,ae,tt,ut,bt+Wt,Fe,ze,xe,Ee):P.copyTexSubImage2D(vt,ae,tt,ut,Fe,ze,xe,Ee);ie.bindFramebuffer(P.READ_FRAMEBUFFER,null),ie.bindFramebuffer(P.DRAW_FRAMEBUFFER,null)}else Ht?A.isDataTexture||A.isData3DTexture?P.texSubImage3D(vt,ae,tt,ut,bt,xe,Ee,Me,mt,Ne,St.data):U.isCompressedArrayTexture?P.compressedTexSubImage3D(vt,ae,tt,ut,bt,xe,Ee,Me,mt,St.data):P.texSubImage3D(vt,ae,tt,ut,bt,xe,Ee,Me,mt,Ne,St):A.isDataTexture?P.texSubImage2D(P.TEXTURE_2D,ae,tt,ut,xe,Ee,mt,Ne,St.data):A.isCompressedTexture?P.compressedTexSubImage2D(P.TEXTURE_2D,ae,tt,ut,St.width,St.height,mt,St.data):P.texSubImage2D(P.TEXTURE_2D,ae,tt,ut,xe,Ee,mt,Ne,St);P.pixelStorei(P.UNPACK_ROW_LENGTH,st),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,$t),P.pixelStorei(P.UNPACK_SKIP_PIXELS,_i),P.pixelStorei(P.UNPACK_SKIP_ROWS,Kt),P.pixelStorei(P.UNPACK_SKIP_IMAGES,as),ae===0&&U.generateMipmaps&&P.generateMipmap(vt),ie.unbindTexture()},this.initRenderTarget=function(A){de.get(A).__webglFramebuffer===void 0&&ve.setupRenderTarget(A)},this.initTexture=function(A){A.isCubeTexture?ve.setTextureCube(A,0):A.isData3DTexture?ve.setTexture3D(A,0):A.isDataArrayTexture||A.isCompressedArrayTexture?ve.setTexture2DArray(A,0):ve.setTexture2D(A,0),ie.unbindTexture()},this.resetState=function(){L=0,b=0,M=null,ie.reset(),N.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Sn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=nt._getDrawingBufferColorSpace(e),t.unpackColorSpace=nt._getUnpackColorSpace()}}function P_(s,e,t,n=.12){if(!(t>0)||!Number.isFinite(s)||!Number.isFinite(e))return{x:0,y:0,throttle:0,steer:0};const i=Math.hypot(s,e),r=i>t?t/i:1,o=s*r/t,a=e*r/t,c=Math.min(1,i/t);if(c<=n)return{x:s*r,y:e*r,throttle:0,steer:0};const l=(c-n)/(1-n);return{x:s*r,y:e*r,throttle:(a>.25?-1:1)*l,steer:o===0?0:-Math.sign(o)*Math.abs(o)**1.15}}function L_(s,e,t,n=.12){if(!(t>0)||!Number.isFinite(s)||!Number.isFinite(e))return{x:0,y:0,dirX:0,dirY:0,power:0,angle:0};const i=Math.hypot(s,e),r=i>t?t/i:1,o=s*r,a=e*r,c=o/t,l=a/t,h=Math.min(1,i/t);if(h<=n)return{x:o,y:a,dirX:0,dirY:0,power:0,angle:0};const u=(h-n)/(1-n),f=Math.atan2(c,-l);return{x:o,y:a,dirX:c,dirY:l,power:u,angle:f}}function Yl(s,e,t=()=>Date.now()){if(!s||typeof e!="function")return;let n=null,i=-1/0,r=-1/0;s.addEventListener("pointerdown",a=>{a.pointerType==="mouse"&&a.button!==0||s.disabled||s.getAttribute?.("aria-disabled")==="true"||(a.preventDefault(),a.stopPropagation(),n=a.pointerId??0,i=t(),e(a))});const o=a=>{n!==null&&(a.pointerId??0)===n&&(n=null,r=t())};s.addEventListener("pointerup",o),s.addEventListener("pointercancel",o),s.addEventListener("click",a=>{a.stopPropagation();const c=t();n!==null||c-i<400||c-r<120||e(a)})}class Kv{constructor(e){this.drag=e,this.throttle=0,this.steer=0,this.power=0,this.angle=0,this.dirX=0,this.dirY=0,this.braking=!1,this.moveId=null,this.cameraId=null,this.brakeId=null,this.stick=document.querySelector("#move-stick"),this.thumb=document.querySelector("#stick-thumb");const t=document.querySelector("#touch-brake");if(this.stick){this.stick.addEventListener("pointerdown",n=>{if(this.moveId!==null&&!n.isPrimary||n.pointerType==="mouse"&&n.button!==0)return;const i=this.stick.getBoundingClientRect();if(i.width>0){n.preventDefault(),this.moveId=n.pointerId;try{this.stick.setPointerCapture(n.pointerId)}catch{}this.center={x:i.left+i.width/2,y:i.top+i.height/2},this.radius=i.width*.34,this.stick.classList.add("engaged"),this.move(n)}}),this.stick.addEventListener("pointermove",n=>{n.pointerId===this.moveId&&(n.preventDefault(),this.move(n))});for(const n of["pointerup","pointercancel","lostpointercapture"])this.stick.addEventListener(n,i=>{i.pointerId===this.moveId&&(this.moveId=null,this.throttle=this.steer=this.power=this.angle=this.dirX=this.dirY=0,this.thumb?.style&&(this.thumb.style.transform="translate(0px,0px)"),this.stick.classList.remove("engaged"))})}if(this.bindCamera(document.querySelector("#game")),t){t.addEventListener("pointerdown",n=>{if(this.brakeId===null){n.preventDefault(),this.brakeId=n.pointerId,this.braking=!0;try{t.setPointerCapture(n.pointerId)}catch{}t.classList.add("engaged")}});for(const n of["pointerup","pointercancel","lostpointercapture"])t.addEventListener(n,i=>{i.pointerId===this.brakeId&&(this.brakeId=null,this.braking=!1,t.classList.remove("engaged"))})}for(const n of[this.stick,t,document.querySelector("#game")])n?.addEventListener("contextmenu",i=>i.preventDefault())}move(e){if(!(this.radius>0)||!Number.isFinite(e.clientX)||!Number.isFinite(e.clientY))return;const t=e.clientX-this.center.x,n=e.clientY-this.center.y,i=P_(t,n,this.radius),r=L_(t,n,this.radius);this.throttle=i.throttle,this.steer=i.steer,this.power=r.power,this.angle=r.angle,this.dirX=r.dirX,this.dirY=r.dirY,this.thumb?.style&&(this.thumb.style.transform=`translate(${r.x}px,${r.y}px)`)}bindCamera(e){if(e){e.addEventListener("pointerdown",t=>{if(!(this.cameraId!==null||t.pointerType==="mouse"&&t.button!==0||!Number.isFinite(t.clientX)||!Number.isFinite(t.clientY))){t.preventDefault(),this.cameraId=t.pointerId;try{e.setPointerCapture(t.pointerId)}catch{}this.drag.active=!0,this.drag.x=t.clientX,this.drag.y=t.clientY,e.classList.add("engaged")}}),e.addEventListener("pointermove",t=>{if(t.pointerId!==this.cameraId||!Number.isFinite(t.clientX)||!Number.isFinite(t.clientY))return;t.preventDefault();const n=this.drag.yaw-(t.clientX-this.drag.x)*.005;Number.isFinite(n)&&(this.drag.yaw=Math.atan2(Math.sin(n),Math.cos(n)));const i=this.drag.pitch+(t.clientY-this.drag.y)*.0035;Number.isFinite(i)&&(this.drag.pitch=Math.max(.12,Math.min(1.05,i))),this.drag.x=t.clientX,this.drag.y=t.clientY});for(const t of["pointerup","pointercancel","lostpointercapture"])e.addEventListener(t,n=>{n.pointerId===this.cameraId&&(this.cameraId=null,this.drag.active=!1,e.classList.remove("engaged"))})}}rebindGameCanvas(e){this.reset(),this.bindCamera(e),e?.addEventListener("contextmenu",t=>t.preventDefault())}reset(){this.moveId=this.cameraId=this.brakeId=null,this.throttle=this.steer=this.power=this.angle=this.dirX=this.dirY=0,this.braking=!1,this.drag.active=!1,this.thumb?.style&&(this.thumb.style.transform="translate(0px,0px)"),document.querySelectorAll(".touch-controls .engaged, #game.engaged").forEach(e=>e.classList.remove("engaged"))}}function I_(s){const e=Math.max(0,Math.ceil((s||0)/1e3)),t=Math.floor(e/60),n=e%60;return`${String(t).padStart(2,"0")}:${String(n).padStart(2,"0")}`}function tn(s){return String(s??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}const D_={"non-la-shield":"👒","perfume-wind":"💨","salt-coffee":"☕"};class N_{constructor(e,{onUsePartyItem:t,onSendEmote:n}={}){if(this.game=e,this.onUsePartyItem=t,this.onSendEmote=n,this.mounted=!1,this.toastUntil=0,this.radarPool=[],this._projVec=new I,this.boardCollapsed=!1,this.emotesOpen=!1,typeof document>"u")return;const i=document.querySelector("#app");if(!i)return;this.mounted=!0,this.radarLayer=document.createElement("div"),this.radarLayer.id="tag-chase-radar",this.radarLayer.setAttribute("aria-hidden","true"),this.topbar=document.createElement("aside"),this.topbar.id="tag-chase-topbar",this.topbar.innerHTML=`
      <div class="tc-top-row">
        <span class="tc-role-pill" id="tc-role-pill">🏃 Người Chạy</span>
        <strong class="tc-timer" id="tc-timer">Chờ bạn (1/2)</strong>
        <span class="tc-score" id="tc-score">0đ</span>
      </div>
      <div class="tc-sub-row" id="tc-hotspot-row" hidden></div>
      <div class="tc-coop-row" id="tc-coop-row" hidden></div>
      <button type="button" id="tc-culture-toggle" aria-expanded="false">📖 Đọc về địa danh</button>
    `,this.board=document.createElement("aside"),this.board.id="tag-chase-board",this.board.innerHTML=`
      <button type="button" class="tc-board-toggle" id="tc-board-toggle" aria-expanded="true">
        <span>🏅 Bảng điểm</span>
        <span class="tc-board-caret">▾</span>
      </button>
      <ol class="tc-board-list" id="tc-board-list"></ol>
    `,this.partyBar=document.createElement("div"),this.partyBar.id="tag-party-bar",this.partyBar.setAttribute("role","group"),this.partyBar.setAttribute("aria-label","Vật phẩm Rượt bắt"),this.partyBar.innerHTML=`
      <div class="tc-buff-pills" id="tc-buff-pills"></div>
      <div class="tc-party-slots">
        ${Ho.map(a=>`
            <button type="button" class="tc-party-slot" data-item="${a.id}" disabled aria-disabled="true" title="${tn(a.name)}: ${tn(a.description)} [${a.key}]">
              <span class="tc-party-icon">${D_[a.id]||"✨"}</span>
              <span class="tc-party-label">${tn(a.shortName)}</span>
              <span class="tc-party-count">0</span>
              <kbd class="tc-party-key">${a.key}</kbd>
            </button>
          `).join("")}
      </div>
    `,this.emoteBar=document.createElement("div"),this.emoteBar.id="tag-emote-bar",this.emoteBar.innerHTML=`
      <button type="button" class="tc-emote-toggle" id="tc-emote-toggle" aria-expanded="false" title="Biểu cảm nhanh">💬</button>
      <div class="tc-emote-drawer" id="tc-emote-drawer" hidden>
        ${oh.map(a=>`<button type="button" class="tc-emote-btn" data-emote="${tn(a.id)}" title="${tn(a.text)}">${tn(a.short)}</button>`).join("")}
      </div>
    `,this.toast=document.createElement("aside"),this.toast.id="tag-action-toast",this.toast.setAttribute("role","status"),this.toast.hidden=!0,this.roundModal=document.createElement("aside"),this.roundModal.id="tag-round-modal",this.roundModal.hidden=!0;const r=document.querySelector("#hud-top-center")||i;r.prepend(this.topbar);const o=r.querySelector("#boost-banner");o?o.after(this.toast):r.append(this.toast),i.append(this.radarLayer,this.board,this.partyBar,this.emoteBar,this.roundModal),this.rolePillEl=this.topbar.querySelector("#tc-role-pill"),this.timerEl=this.topbar.querySelector("#tc-timer"),this.scoreEl=this.topbar.querySelector("#tc-score"),this.hotspotEl=this.topbar.querySelector("#tc-hotspot-row"),this.coopEl=this.topbar.querySelector("#tc-coop-row"),this.cultureToggle=this.topbar.querySelector("#tc-culture-toggle"),this.cultureToggle.addEventListener("click",()=>{const a=document.body.classList.toggle("tag-culture-open");this.cultureToggle.setAttribute("aria-expanded",String(a))}),this.boardListEl=this.board.querySelector("#tc-board-list"),this.boardToggleEl=this.board.querySelector("#tc-board-toggle"),this.buffPillsEl=this.partyBar.querySelector("#tc-buff-pills"),this.emoteDrawerEl=this.emoteBar.querySelector("#tc-emote-drawer"),this.emoteToggleEl=this.emoteBar.querySelector("#tc-emote-toggle"),this.boardToggleEl.addEventListener("click",()=>{this.boardCollapsed=!this.boardCollapsed,this.boardListEl.hidden=this.boardCollapsed,this.boardToggleEl.setAttribute("aria-expanded",String(!this.boardCollapsed)),this.board.classList.toggle("is-collapsed",this.boardCollapsed)}),this.emoteToggleEl.addEventListener("click",()=>{this.emotesOpen=!this.emotesOpen,this.emoteDrawerEl.hidden=!this.emotesOpen,this.emoteToggleEl.setAttribute("aria-expanded",String(this.emotesOpen))}),this.partyButtons=new Map,this.partyBar.querySelectorAll("[data-item]").forEach(a=>{const c=a.dataset.item;this.partyButtons.set(c,a),Yl(a,()=>{this.onUsePartyItem?.(c)})}),this.emoteBar.querySelectorAll("[data-emote]").forEach(a=>{Yl(a,()=>{this.onSendEmote?.(a.dataset.emote),this.emotesOpen=!1,this.emoteDrawerEl.hidden=!0,this.emoteToggleEl.setAttribute("aria-expanded","false")})})}showToast(e,t=2800,n="info"){!this.mounted||!e||(this.toast.textContent=e,this.toast.dataset.tone=n,this.toast.hidden=!1,this.toastUntil=Date.now()+t)}updateInventory(e,{stunned:t=!1}={}){if(this.mounted)for(const[n,i]of this.partyButtons){const r=Math.max(0,Number(e?.[n]||0)),o=r>0&&(!t||n==="salt-coffee");i.disabled=!o,i.setAttribute("aria-disabled",String(!o)),i.classList.toggle("has-item",r>0),i.classList.toggle("is-ready",o);const a=i.querySelector(".tc-party-count");a&&(a.textContent=String(r))}}updateState(e,t,n,{shieldMs:i=0,slowMs:r=0,coffeeMs:o=0}={}){if(!this.mounted)return;const a=Date.now();!this.toast.hidden&&a>=this.toastUntil&&(this.toast.hidden=!0);const c=document.querySelector(".brand"),l=document.querySelector("#hud-top-center");if(c&&typeof c.getBoundingClientRect=="function"){const _=c.getBoundingClientRect();if(_.height>0){let p=_.bottom+8;if(l&&typeof l.getBoundingClientRect=="function"){const v=l.getBoundingClientRect();v.height>0&&v.top>=_.bottom-4&&v.left<185&&(p=Math.max(p,v.bottom+8))}this.board.style.top=`${Math.round(p)}px`}}const h=e?.phase||"waiting",u=h==="playing"?e?.stage||"chase":h;document.body.dataset.tagStage=u,this.partyBar.hidden=u!=="chase",this.cultureToggle.hidden=u==="chase",this.previousStage!==u&&(document.body.classList.remove("tag-culture-open"),this.cultureToggle.setAttribute("aria-expanded","false"),this.previousStage=u);const f=t?.role==="hunter";if(this.rolePillEl.textContent=f?"🔥 Người Săn":"🏃 Người Chạy",u!=="chase"&&(this.rolePillEl.textContent=u==="cooperation"?"🤝 Đồng hành":"🗺️ Khám phá Huế"),this.rolePillEl.classList.toggle("is-hunter",f&&u==="chase"),this.scoreEl.textContent=`${t?.score||0}đ`,h==="waiting"){const _=e?.playerCount||1;this.timerEl.textContent=`Chờ bạn (${_}/2)`}else if(h==="countdown"){const _=Math.max(1,Math.ceil((e?.remainingMs||0)/1e3));this.timerEl.textContent=`Chuẩn bị ${_}s`}else if(h==="intermission"){const _=Math.max(1,Math.ceil((e?.remainingMs||0)/1e3));this.timerEl.textContent=`Ván mới ${_}s`}else this.timerEl.textContent=`${u==="chase"?"Tranh tài":u==="cooperation"?"Hợp tác":"Khám phá"} ${I_(e?.stageRemainingMs)}`;const d=e?.hotspot,x=this.game?.bike?.position;if(d&&h==="playing"){const _=x?Math.round(Math.hypot(x.x-d.x,x.z-d.z)):null,p=_!==null&&_<=(d.radius||28);this.hotspotEl.hidden=!1,this.hotspotEl.classList.toggle("is-inside",p),this.hotspotEl.textContent=p?`📍 ${d.title}${u==="chase"&&!f?" · x2 điểm khi đang chạy trốn":" · Điểm hẹn"}`:`📍 ${d.title}${_!==null?` · ${_}m`:""}`}else this.hotspotEl.hidden=!0;const y=e?.coop;if(y?.active){this.coopEl.hidden=!1;const _=y.itemKind==="lotus"?"🪷":"🏮",p=Math.max(0,Math.ceil((y.remainingMs||0)/1e3));this.coopEl.textContent=`${_} ${y.title}: ${y.collected}/${y.target} · ${p}s`}else this.coopEl.hidden=!0;const g=[];i>0&&g.push(`<span class="tc-buff is-shield">👒 Khiên ${Math.ceil(i/1e3)}s</span>`),o>0&&g.push(`<span class="tc-buff is-coffee">☕ +25% ${Math.ceil(o/1e3)}s</span>`),r>0&&g.push(`<span class="tc-buff is-slow">💨 Chậm ${Math.ceil(r/1e3)}s</span>`),this.buffPillsEl.innerHTML=g.join("");const m=(e?.leaderboard||[]).slice(0,3);if(this.boardListEl.innerHTML=m.length?m.map((_,p)=>`
              <li class="${_.id===n?"is-self":""}">
                <span class="tc-b-rank">${p+1}.</span>
                <span class="tc-b-role">${u==="chase"?_.role==="hunter"?"🔥":"🏃":u==="cooperation"?"🤝":"🗺️"}</span>
                <span class="tc-b-name">${tn(_.name)}</span>
                <strong class="tc-b-score">${_.score}đ</strong>
              </li>
            `).join(""):'<li class="tc-b-empty">Chưa có điểm</li>',h==="intermission"&&Array.isArray(e?.awards)&&e.awards.length){const _=(e.leaderboard||[]).slice(0,3);this.roundModal.hidden=!1,this.roundModal.innerHTML=`
        <h3>🏁 Tổng kết Ván ${e.roundNumber||1}</h3>
        <div class="tc-awards-grid">
          ${e.awards.map(p=>`
                <div class="tc-award-card">
                  <span class="tc-award-icon">${tn(p.icon)}</span>
                  <div>
                    <strong>${tn(p.title)}</strong>
                    <small>${tn(p.playerName)} · ${tn(p.detail)}</small>
                  </div>
                </div>
              `).join("")}
        </div>
        ${_.length?`<div class="tc-modal-top">${_.map((p,v)=>`<span>#${v+1} ${tn(p.name)} (${p.score}đ)</span>`).join("")}</div>`:""}
      `}else this.roundModal.hidden=!0}updateRadar(e,t){if(!this.mounted||!this.game?.camera||!this.game?.bike)return;const n=this.game.camera,i=this.game.bike.position;n.updateMatrixWorld?.();const r=typeof window<"u"?window.innerWidth:1024,o=typeof window<"u"?window.innerHeight:768,a=Math.max(36,Math.min(64,r*.06)),c=Math.max(54,Math.min(84,o*.1)),l=[];for(const h of e||[]){if(!h||h.id===t||!h.connected||!h.ready||!Number.isFinite(h.x)||!Number.isFinite(h.z))continue;const u=Math.hypot(h.x-i.x,h.z-i.z);if(u<4)continue;this._projVec.set(h.x,(h.y||.2)+1.2,h.z),this._projVec.project(n);const f=this._projVec.z>1;let d=f?-this._projVec.x:this._projVec.x,x=f?-this._projVec.y:this._projVec.y;if(!f&&Math.abs(d)<=.88&&Math.abs(x)<=.82)continue;const g=Math.hypot(d,x)||1;d/=g,x/=g;const m=r/2-a,_=o/2-c,p=Math.min(Math.abs(d)>1e-4?m/Math.abs(d):1/0,Math.abs(x)>1e-4?_/Math.abs(x):1/0),v=r/2+d*p,T=o/2-x*p,S=Math.atan2(-x,d)*180/Math.PI;l.push({id:h.id,role:h.modeData?.role||"runner",dist:Math.round(u),sx:v,sy:T,deg:S})}for(;this.radarPool.length<l.length;){const h=document.createElement("div");h.className="tc-radar-ping",h.innerHTML='<i class="tc-radar-arrow">➤</i><span></span>',this.radarLayer.append(h),this.radarPool.push(h)}for(let h=0;h<this.radarPool.length;h++){const u=this.radarPool[h],f=l[h];if(!f){u.hidden=!0;continue}u.hidden=!1,u.classList.toggle("is-hunter",f.role==="hunter"),u.style.transform=`translate(${f.sx}px, ${f.sy}px) translate(-50%, -50%)`,u.querySelector(".tc-radar-arrow").style.transform=`rotate(${f.deg}deg)`,u.querySelector("span").textContent=`${f.dist}m`}}dispose(){this.mounted&&(delete document.body.dataset.tagStage,document.body.classList.remove("tag-culture-open"),this.radarLayer.remove(),this.topbar.remove(),this.board.remove(),this.partyBar.remove(),this.emoteBar.remove(),this.toast.remove(),this.roundModal.remove(),this.radarPool=[],this.partyButtons.clear(),this.mounted=!1)}}new I(0,1,0);function U_(s){if(typeof document>"u")return null;const e=document.createElement("canvas");e.width=320,e.height=96;const t=e.getContext?.("2d");if(!t)return null;t.clearRect(0,0,e.width,e.height);const n=10,i=10,r=300,o=64,a=24;return t.beginPath(),t.moveTo(n+a,i),t.lineTo(n+r-a,i),t.quadraticCurveTo(n+r,i,n+r,i+a),t.lineTo(n+r,i+o-a),t.quadraticCurveTo(n+r,i+o,n+r-a,i+o),t.lineTo(n+r*.56,i+o),t.lineTo(n+r*.5,i+o+14),t.lineTo(n+r*.44,i+o),t.lineTo(n+a,i+o),t.quadraticCurveTo(n,i+o,n,i+o-a),t.lineTo(n,i+a),t.quadraticCurveTo(n,i,n+a,i),t.closePath(),t.fillStyle="rgba(15, 36, 31, 0.94)",t.fill(),t.lineWidth=3,t.strokeStyle="#ffd36a",t.stroke(),t.fillStyle="#fff7e2",t.font='700 28px "Be Vietnam Pro", system-ui, sans-serif',t.textAlign="center",t.textBaseline="middle",t.fillText(String(s||""),e.width/2,i+o/2+1,276),e}class F_{constructor(e){this.game=e,this.scene=e?.scene||null,this.root=new Ge,this.root.name="tag-chase-fx",this.scene?.add(this.root),this.boxes=new Map,this.coopMeshes=new Map,this.playerAuras=new Map,this.windWaves=[],this.emoteBubbles=[],this.fireworks=[],this.hotspotGroup=new Ge,this.hotspotGroup.visible=!1,this.hotspotRingGeo=new Mn(27.2,28,48),this.hotspotRingGeo.rotateX(-Math.PI/2),this.hotspotRingMat=new Tt({color:"#ffd36a",transparent:!0,opacity:.48,side:Et,depthWrite:!1}),this.hotspotRing=new Ze(this.hotspotRingGeo,this.hotspotRingMat),this.hotspotRing.position.y=.12,this.hotspotBeamGeo=new Nt(1.1,1.8,18,20,1,!0),this.hotspotBeamMat=new Tt({color:"#ffcf5c",transparent:!0,opacity:.16,side:Et,depthWrite:!1}),this.hotspotBeam=new Ze(this.hotspotBeamGeo,this.hotspotBeamMat),this.hotspotBeam.position.y=9.2,this.hotspotGroup.add(this.hotspotRing,this.hotspotBeam),this.root.add(this.hotspotGroup),this.boxCoreGeo=new Yt(.72,.72,.72),this.boxRibbonGeo=new Yt(.76,.16,.76),this.boxRingGeo=new Mn(.65,1,24),this.boxRingGeo.rotateX(-Math.PI/2),this.boxCoreMat=new fn({color:"#d94f3d",emissive:"#8a2216",emissiveIntensity:.75,roughness:.3}),this.boxRibbonMat=new fn({color:"#ffd66b",emissive:"#c98b18",emissiveIntensity:.65,roughness:.25}),this.boxRingMat=new Tt({color:"#ffd66b",transparent:!0,opacity:.45,side:Et,depthWrite:!1}),this.coopLanternGeo=new it(.45,12,10),this.coopLanternCapGeo=new Nt(.24,.24,.12,12),this.coopRingGeo=new Mn(.55,.92,22),this.coopRingGeo.rotateX(-Math.PI/2),this.lanternMat=new fn({color:"#ff5c3d",emissive:"#ff8c38",emissiveIntensity:1,roughness:.25}),this.lotusMat=new fn({color:"#ff88c2",emissive:"#e34292",emissiveIntensity:.9,roughness:.28}),this.coopCapMat=new fn({color:"#ffd66b",roughness:.3}),this.coopRingMat=new Tt({color:"#ff9b54",transparent:!0,opacity:.48,side:Et,depthWrite:!1}),this.auraRingGeo=new Mn(.75,1.06,28),this.auraRingGeo.rotateX(-Math.PI/2),this.nonLaGeo=new on(.55,.32,18,1,!0),this.shieldOrbitGeo=new kt(.95,.04,8,28),this.windWaveGeo=new Mn(.8,1.25,32),this.windWaveGeo.rotateX(-Math.PI/2),this.fireworkParticleGeo=new it(.18,6,6)}ensureSceneAttached(){this.game?.scene&&this.root.parent!==this.game.scene&&(this.scene=this.game.scene,this.scene.add(this.root))}groundY(e,t,n=.2){const i=this.game?.world?.groundAt?.(e,t,n);return Number.isFinite(i)?i:n}syncState(e){this.ensureSceneAttached();const t=e?.hotspot;t&&Number.isFinite(t.x)&&Number.isFinite(t.z)?(this.hotspotGroup.visible=!0,this.hotspotGroup.position.set(t.x,this.groundY(t.x,t.z,.2),t.z)):this.hotspotGroup.visible=!1;const n=new Set;for(const o of e?.partyBoxes||[]){if(!o?.id||(n.add(o.id),this.boxes.has(o.id)))continue;const a=new Ge,c=new Ze(this.boxCoreGeo,this.boxCoreMat);c.position.y=.9;const l=new Ze(this.boxRibbonGeo,this.boxRibbonMat);l.position.y=.9;const h=new Ze(this.boxRingGeo,this.boxRingMat);h.position.y=.08,a.add(c,l,h);const u=this.groundY(o.x,o.z,o.y||.2);a.position.set(o.x,u,o.z),this.root.add(a),this.boxes.set(o.id,{group:a,core:c,ribbon:l,ring:h,phase:this.boxes.size*1.1%(Math.PI*2)})}for(const[o,a]of this.boxes)n.has(o)||(a.group.removeFromParent(),this.boxes.delete(o));const i=new Set,r=e?.coop?.active?e.coop.items||[]:[];for(const o of r){if(!o?.id||(i.add(o.id),this.coopMeshes.has(o.id)))continue;const a=new Ge,c=o.kind==="lotus",l=new Ze(this.coopLanternGeo,c?this.lotusMat:this.lanternMat);l.scale.set(1,c?.65:1.18,1),l.position.y=1.05;const h=new Ze(this.coopLanternCapGeo,this.coopCapMat);h.position.y=c?.72:1.56;const u=new Ze(this.coopRingGeo,this.coopRingMat);u.position.y=.08,a.add(l,h,u);const f=this.groundY(o.x,o.z,o.y||.2);a.position.set(o.x,f,o.z),this.root.add(a),this.coopMeshes.set(o.id,{group:a,body:l,cap:h,capBaseY:h.position.y,phase:this.coopMeshes.size*.9%(Math.PI*2)})}for(const[o,a]of this.coopMeshes)i.has(o)||(a.group.removeFromParent(),this.coopMeshes.delete(o))}hidePickup(e){const t=this.boxes.get(e);t&&(t.group.removeFromParent(),this.boxes.delete(e));const n=this.coopMeshes.get(e);n&&(n.group.removeFromParent(),this.coopMeshes.delete(e))}ensurePlayerAura(e,t){let n=this.playerAuras.get(e);if(!n){const i=new Ge;i.name=`tag-aura-${e}`;const r=new Tt({color:"#ff5a36",transparent:!0,opacity:.72,side:Et,depthWrite:!1}),o=new Ze(this.auraRingGeo,r);o.position.y=.1;const a=new Ge;a.visible=!1;const c=new fn({color:"#f2ce7c",emissive:"#a67c22",emissiveIntensity:.45,transparent:!0,opacity:.85,side:Et}),l=new Ze(this.nonLaGeo,c);l.position.y=2.05;const h=new Tt({color:"#ffd36a",transparent:!0,opacity:.75}),u=new Ze(this.shieldOrbitGeo,h);u.rotation.x=Math.PI/2,u.position.y=.95,a.add(l,u);const f=new Tt({color:"#6ee7ff",transparent:!0,opacity:.6,side:Et,depthWrite:!1}),d=new Ze(this.auraRingGeo,f);d.position.y=.18,d.scale.setScalar(1.22),d.visible=!1,i.add(o,a,d),n={group:i,roleRing:o,roleMat:r,shieldGroup:a,nonLa:l,nonLaMat:c,orbit:u,orbitMat:h,slowRing:d,slowMat:f},this.playerAuras.set(e,n)}return t&&n.group.parent!==t&&(n.group.removeFromParent(),t.add(n.group)),n}updatePlayerAura(e,t,n,i){if(!t)return;const r=this.ensurePlayerAura(e,t),o=this.stage==="chase"&&n?.role==="hunter";if(r.roleRing.visible=o||!!n?.coffeeBoost,o){r.roleMat.color.set("#ff4b2b");const a=1+Math.sin(i*8)*.12;r.roleRing.scale.setScalar(a)}else n?.coffeeBoost&&(r.roleMat.color.set("#ff9b54"),r.roleRing.scale.setScalar(1.08+Math.sin(i*12)*.08));r.shieldGroup.visible=!!n?.shielded,r.shieldGroup.visible&&(r.nonLa.rotation.y=i*2.2,r.orbit.rotation.z=i*3.1,r.orbit.scale.setScalar(1+Math.sin(i*5)*.05)),r.slowRing.visible=!!n?.slowed,r.slowRing.visible&&(r.slowRing.rotation.z=i*1.8,r.slowMat.opacity=.4+.25*Math.sin(i*7))}spawnWindWave(e,t,n){this.ensureSceneAttached();const i=new Tt({color:"#6ee7ff",transparent:!0,opacity:.88,side:Et,depthWrite:!1}),r=new Ze(this.windWaveGeo,i);r.position.set(e,this.groundY(e,n,t)+.16,n),this.root.add(r),this.windWaves.push({mesh:r,mat:i,age:0,duration:.72})}spawnEmoteBubble(e,t){if(!e||!t)return;const n=U_(t);if(!n)return;const i=new sc(n);i.needsUpdate=!0;const r=new Qa({map:i,transparent:!0,opacity:1,depthTest:!1}),o=new Nh(r);o.position.set(0,2.55,0),o.scale.set(2.4,.72,1),o.renderOrder=25,e.add(o),this.emoteBubbles.push({sprite:o,mat:r,tex:i,age:0,duration:2.8,baseY:2.55})}spawnFireworkVolley(e,t){this.ensureSceneAttached();const n=["#ffd36a","#ff5c7a","#6ee7ff","#98ff98","#ff9b54"],i=this.groundY(e,t,.5);for(let r=0;r<5;r++){const o=e+(r-2)*10+(Math.random()-.5)*6,a=t+(Math.random()-.5)*14,c=i+12+Math.random()*8,l=n[r%n.length],h=new Tt({color:l,transparent:!0,opacity:1}),u=[];for(let f=0;f<18;f++){const d=new Ze(this.fireworkParticleGeo,h);d.position.set(o,c,a);const x=f/18*Math.PI*2,y=(f%3-1)*.65+(Math.random()-.5)*.4,g=7+Math.random()*4.5,m=Math.cos(x)*Math.cos(y)*g,_=Math.sin(y)*g+2.5,p=Math.sin(x)*Math.cos(y)*g;this.root.add(d),u.push({mesh:d,vx:m,vy:_,vz:p})}this.fireworks.push({particles:u,mat:h,age:-r*.22,duration:1.9})}}update(e,t,n,i){this.ensureSceneAttached();const r=this.game?.bike?.position;this.hotspotGroup.visible&&(this.hotspotRing.rotation.z=t*.22,this.hotspotRingMat.opacity=.34+.16*Math.sin(t*2.5),this.hotspotBeam.rotation.y=t*.5);for(const a of this.boxes.values()){const c=r?(a.group.position.x-r.x)**2+(a.group.position.z-r.z)**2:0;if(a.group.visible=c<260*260,!a.group.visible)continue;const l=Math.sin(t*2.8+a.phase)*.16;a.core.position.y=.9+l,a.ribbon.position.y=.9+l,a.core.rotation.y=t*1.9+a.phase,a.ribbon.rotation.y=t*1.9+a.phase,a.ring.scale.setScalar(1+Math.sin(t*3.5+a.phase)*.12)}for(const a of this.coopMeshes.values()){const c=r?(a.group.position.x-r.x)**2+(a.group.position.z-r.z)**2:0;if(a.group.visible=c<280*280,!a.group.visible)continue;const l=Math.sin(t*3.2+a.phase)*.18;a.body.position.y=1.05+l,a.cap.position.y=a.capBaseY+l,a.body.rotation.y=t*1.5+a.phase}this.game?.bike&&this.updatePlayerAura("self",this.game.bike,n,t);const o=new Set(["self"]);if(i)for(const[a,c]of i)c?.bike&&(o.add(a),this.updatePlayerAura(a,c.bike,c.target?.modeData,t));for(const[a,c]of this.playerAuras)o.has(a)||(this.disposeAuraEntry(c),this.playerAuras.delete(a));for(let a=this.windWaves.length-1;a>=0;a--){const c=this.windWaves[a];c.age+=e;const l=Math.min(1,c.age/c.duration);c.mesh.scale.setScalar(1+l*8.2),c.mat.opacity=.85*(1-l),l>=1&&(c.mesh.removeFromParent(),c.mat.dispose(),this.windWaves.splice(a,1))}for(let a=this.emoteBubbles.length-1;a>=0;a--){const c=this.emoteBubbles[a];c.age+=e;const l=Math.min(1,c.age/c.duration);c.sprite.position.y=c.baseY+l*.55,c.mat.opacity=l>.72?Math.max(0,1-(l-.72)/.28):1,l>=1&&(c.sprite.removeFromParent(),c.mat.dispose(),c.tex.dispose(),this.emoteBubbles.splice(a,1))}for(let a=this.fireworks.length-1;a>=0;a--){const c=this.fireworks[a];if(c.age+=e,c.age<0){for(const h of c.particles)h.mesh.visible=!1;continue}const l=Math.min(1,c.age/c.duration);c.mat.opacity=Math.max(0,1-l*l);for(const h of c.particles)h.mesh.visible=!0,h.mesh.position.x+=h.vx*e,h.mesh.position.y+=h.vy*e,h.mesh.position.z+=h.vz*e,h.vy-=5.2*e,h.vx*=.985,h.vz*=.985;if(l>=1){for(const h of c.particles)h.mesh.removeFromParent();c.mat.dispose(),this.fireworks.splice(a,1)}}}disposeAuraEntry(e){e.group.removeFromParent(),e.roleMat.dispose(),e.nonLaMat.dispose(),e.orbitMat.dispose(),e.slowMat.dispose()}dispose(){for(const e of this.boxes.values())e.group.removeFromParent();this.boxes.clear();for(const e of this.coopMeshes.values())e.group.removeFromParent();this.coopMeshes.clear();for(const e of this.playerAuras.values())this.disposeAuraEntry(e);this.playerAuras.clear();for(const e of this.windWaves)e.mesh.removeFromParent(),e.mat.dispose();this.windWaves=[];for(const e of this.emoteBubbles)e.sprite.removeFromParent(),e.mat.dispose(),e.tex.dispose();this.emoteBubbles=[];for(const e of this.fireworks){for(const t of e.particles)t.mesh.removeFromParent();e.mat.dispose()}this.fireworks=[],this.root.removeFromParent(),this.hotspotRingGeo.dispose(),this.hotspotRingMat.dispose(),this.hotspotBeamGeo.dispose(),this.hotspotBeamMat.dispose(),this.boxCoreGeo.dispose(),this.boxRibbonGeo.dispose(),this.boxRingGeo.dispose(),this.boxCoreMat.dispose(),this.boxRibbonMat.dispose(),this.boxRingMat.dispose(),this.coopLanternGeo.dispose(),this.coopLanternCapGeo.dispose(),this.coopRingGeo.dispose(),this.lanternMat.dispose(),this.lotusMat.dispose(),this.coopCapMat.dispose(),this.coopRingMat.dispose(),this.auraRingGeo.dispose(),this.nonLaGeo.dispose(),this.shieldOrbitGeo.dispose(),this.windWaveGeo.dispose(),this.fireworkParticleGeo.dispose()}}const O_={id:"tag-chase",kind:"special",title:"Rượt bắt tốc độ",shortTitle:"Rượt bắt",description:"Khám phá địa danh Huế, tranh tài rượt bắt ngắn rồi cùng hoàn thành nhiệm vụ. Ghi nhận lượt ghé thăm và đóng góp đồng hành.",regions:["quoc-hoc","quang-trung"],enabled:!0,upcoming:!1,charmsEnabled:!0,maxPlayers:10,createClientSession(s){let e=null,t=[],n=null,i="runner",r=0,o=0,a=0,c=0,l=0,h=0,u={"non-la-shield":0,"perfume-wind":0,"salt-coffee":0};const f=new Map,d=new F_(s),x=new N_(s,{onUsePartyItem:p=>g(p),onSendEmote:p=>m(p)});function y(){if(typeof document>"u")return;const p=document.querySelector("#collision-toast");p&&(p.hidden=!0)}function g(p){if(e?.phase!=="playing"||e?.stage!=="chase")return!1;const v=ch(p);if(!v||(u[v]||0)<=0)return!1;if(v!=="salt-coffee"&&(s?.stun||0)>0)return x.showToast("☕ Đang choáng — dùng Cà Phê Muối [F] để giải choáng!",1900,"alert"),!1;const T=Date.now();return l=T,u={...u,[v]:Math.max(0,(u[v]||0)-1)},v==="non-la-shield"?(o=T+Se.shieldDurationMs,s?.audio?.playShieldActivate?.(),x.showToast("👒 Khiên Nón Lá kích hoạt (6s)!",2200,"success")):v==="perfume-wind"?(s?.audio?.playWindGust?.(),s?.bike?.position&&d.spawnWindWave(s.bike.position.x,s.bike.position.y,s.bike.position.z),x.showToast("💨 Gió Sông Hương làm chậm đối thủ quanh bạn!",2100,"info")):v==="salt-coffee"&&(s&&(s.stun=0,s.noticeTime=0,s.collisionCooldown=Math.max(s.collisionCooldown||0,.8)),y(),a=0,c=T+Se.coffeeBoostDurationMs,s?.audio?.playCoffeeBoost?.(),x.showToast("☕ Cà Phê Muối! Giải choáng & vọt +25% tốc độ!",2200,"success")),s?.online?.sendModeAction?.("use_party_item",{itemId:v}),x.updateInventory(u,{stunned:(s?.stun||0)>0}),!0}function m(p){const v=lh(p);if(!v)return!1;const T=Date.now();return T-h<Se.emoteCooldownMs?!1:(h=T,s?.online?.sendModeAction?.("emote",{emoteId:v}),!0)}const _=p=>{if(s?.sessionActive===!1||p.repeat||p.target?.closest?.('input,select,textarea,[contenteditable="true"]'))return;const v=p.key?.toLowerCase?.();v==="q"?g("non-la-shield"):v==="e"?g("perfume-wind"):v==="f"&&g("salt-coffee")};return typeof window<"u"&&window.addEventListener("keydown",_),{get speedMultiplier(){const p=Date.now();let v=e?.phase==="playing"&&e?.stage==="chase"&&i==="hunter"?Se.hunterSpeedMultiplier:1;return p<a&&(v*=Se.windSlowMultiplier),p<c&&(v*=Se.coffeeBoostMultiplier),v},onSnapshot(p,v){n=v,t=p?.players||[];const T=t.find(S=>S.id===v);if(T?.modeData){i=T.modeData.role||"runner",r=T.modeData.score||0;const S=Date.now();S-l>750&&(T.modeData.shielded||(o=0),T.modeData.coffeeBoost||(c=0)),!T.modeData.slowed&&S-l>400&&(a=Math.min(a,S))}},onServerEvent(p){if(!p||typeof p!="object")return;const v=Date.now();if(p.event==="landmark_visit"){x.showToast(`🗺️ Đã ghé ${p.title} · +${p.points}đ`);return}if(p.event==="tag_state"){const T=e?.phase;e=p,d.stage=p.phase==="playing"?p.stage:null,p.stage!=="chase"&&(a=0,c=0),p.phase!==T&&(p.phase==="countdown"||p.phase==="waiting")&&(o=0,a=0,c=0);const S=new Set([...(p.partyBoxes||[]).map(w=>w.id),...(p.coop?.active?p.coop.items||[]:[]).map(w=>w.id)]);for(const w of f.keys())(!S.has(w)||v-f.get(w)>2500)&&f.delete(w);d.syncState(p);return}if(p.event==="party_inventory"){if(p.inventory&&(u={...p.inventory}),p.pickedItem&&zi[p.pickedItem]){const T=zi[p.pickedItem];s?.audio?.playCharmPickup?.("20"),x.showToast(`🎁 Nhặt được ${T.name} [${T.key}]!`,2400,"success")}x.updateInventory(u,{stunned:(s?.stun||0)>0});return}if(p.event==="party_used"&&p.itemId==="non-la-shield"){o=v+(p.durationMs||Se.shieldDurationMs);return}if(p.event==="wind_gust"){d.spawnWindWave(p.x??s?.bike?.position?.x??0,p.y??s?.bike?.position?.y??.3,p.z??s?.bike?.position?.z??0),p.casterId!==n&&s?.audio?.playWindGust?.();return}if(p.event==="wind_slowed"){a=v+(p.durationMs||Se.windSlowDurationMs),x.showToast(`💨 Dính Gió Sông Hương từ ${p.byName||"đối thủ"}!`,2100,"alert");return}if(p.event==="coffee_boost"){s&&(s.stun=0,s.noticeTime=0),y(),a=0,c=v+(p.durationMs||Se.coffeeBoostDurationMs);return}if(p.event==="tag_swap"){p.youTagged?(i="runner",s?.audio?.playTagHit?.(!1),x.showToast(`🔥 Bắt trúng ${p.victimName}! +${p.points}đ · Đổi vai Người Chạy!`,3e3,"success")):p.youWereTagged&&(i="hunter",s&&(s.stun=Math.max(s.stun||0,(p.stunMs||450)/1e3)),s?.audio?.playTagHit?.(!0),x.showToast(`⚡ ${p.hunterName} bắt trúng bạn! Bạn là Người Săn mới!`,3e3,"alert"));return}if(p.event==="shield_block"){s?.audio?.playShieldBlock?.(),p.role==="defender"?(o=0,x.showToast(`👒 Khiên Nón Lá hất văng ${p.attackerName}! +${p.points}đ!`,2800,"success")):p.role==="attacker"&&(s&&(s.stun=Math.max(s.stun||0,(p.stunMs||800)/1e3)),x.showToast(`👒 ${p.defenderName} đang đeo Khiên Nón Lá! Bạn bị choáng!`,2600,"alert"));return}if(p.event==="tag_bump"){s&&(s.stun=Math.max(s.stun||0,.35)),s?.audio?.collision?.();return}if(p.event==="close_call"){s?.audio?.playCloseCall?.();const T=p.combo>1?` x${p.combo}`:"";x.showToast(`💨 Thoát Hiểm Gang Tấc!${T} +${p.points}đ!`,2500,"success");return}if(p.event==="coop_start"){x.showToast(`🏮 Nhiệm vụ toàn phòng: ${p.title}!`,3400,"info");return}if(p.event==="coop_end"){if(p.success){s?.audio?.playFireworkBurst?.();const T=s?.bike?.position||{x:0,z:0};d.spawnFireworkVolley(T.x,T.z),x.showToast(`🎆 Hoàn thành: ${p.title}! Người có đóng góp +${p.reward}đ!`,4200,"success")}else x.showToast(`⏳ Hết giờ nhiệm vụ: ${p.title}`,2500,"alert");return}if(p.event==="tag_banner"&&p.text){x.showToast(p.text,2800,"info");return}if(p.event==="emote"){const T=p.playerId===n?s?.bike:s?.online?.avatars?.entries?.get?.(p.playerId)?.bike;T&&d.spawnEmoteBubble(T,p.text),s?.audio?.playEmotePop?.()}},handleTrafficContact(p){return Date.now()>=o?!1:(o=0,p&&(p.pause=1.6),s&&(s.collisionCooldown=2),s?.online?.sendModeAction?.("traffic_shield_block",{}),s?.audio?.playShieldBlock?.(),x.showToast("👒 Khiên Nón Lá đỡ cho bạn khỏi va chạm! (+30đ)",2600,"success"),!0)},update(p,v){const T=Date.now(),S=s?.bike?.position;if(S&&s?.online?.canMove!==!1&&!(s?.stun>0)&&e){for(const M of e.partyBoxes||[])!M?.id||f.has(M.id)||Math.hypot(S.x-M.x,S.z-M.z)<=2.6&&(f.set(M.id,T),d.hidePickup(M.id),s.online?.sendModeAction?.("party_pickup",{boxId:M.id}));if(e.coop?.active)for(const M of e.coop.items||[])!M?.id||f.has(M.id)||Math.hypot(S.x-M.x,S.z-M.z)<=2.7&&(f.set(M.id,T),d.hidePickup(M.id),s?.audio?.playCharmPickup?.("10"),s.online?.sendModeAction?.("coop_pickup",{itemId:M.id}))}const w=Math.max(0,o-T),L=Math.max(0,a-T),b=Math.max(0,c-T);d.update(p,v,{role:i,shielded:w>0,slowed:L>0,coffeeBoost:b>0},s?.online?.avatars?.entries),x.updateInventory(u,{stunned:(s?.stun||0)>0}),x.updateState(e,{role:i,score:r},n,{shieldMs:w,slowMs:L,coffeeMs:b}),x.updateRadar(t,n)},dispose(){typeof window<"u"&&window.removeEventListener("keydown",_),d.dispose(),x.dispose()}}},createServerRoomState(s,e){return Vu(s,e)}},B_={id:"checkpoint-race",kind:"special",title:"Đua Check-point Cố Đô",shortTitle:"Đua Check-point",description:"Chạy tiếp sức hoặc đua thời gian qua các điểm mốc địa danh nổi tiếng trên tuyến 01 & 05.",regions:["quoc-hoc","quang-trung"],enabled:!1,upcoming:!0,charmsEnabled:!0,maxPlayers:10,createClientSession(){return{update(){},onServerEvent(){},dispose(){}}},createServerRoomState(){return{tick(){},onJoin(){},onLeave(){},onCollision(){},publicSummary(){return null}}}},Ls="free-roam",z_=["quoc-hoc","quang-trung"],k_=2,hu=[za,O_,B_],uu=new Map(hu.map(s=>[s.id,s]));function du(s){return z_.includes(s)}function fu(s,e){return s?s.regions==="*"?!0:Array.isArray(s.regions)&&s.regions.includes(e):!1}function jv(s){return uu.get(s)||za}function V_(s,e=null){const t=typeof s=="string"?uu.get(s):null;return!t||t.enabled!==!0||e&&!fu(t,e)||t.kind==="special"&&e&&!du(e)?Ls:t.id}function Jv(s,{includeUpcoming:e=!0}={}){const t=hu.filter(n=>n.kind==="special"&&du(s)&&fu(n,s)&&(e?n.enabled||n.upcoming:n.enabled)).slice(0,k_);return[za,...t]}function Zv(s,e=Ls){const t=V_(e,s);return t===Ls?s:`${s}::${t}`}const G_="/online",H_=10,Qv={path:G_,maxPlayersPerRegion:H_};function ey(s,e,t="#247bba",n=!1){s.identity&&(s.identity.removeFromParent(),s.identity.traverse(u=>{u.geometry?.dispose(),u.material&&(u.material.map?.dispose(),u.material.dispose())}),s.identity=null,s.identityTag=null);const i=Nu(e);if(s.playerName=i,n&&typeof s.setBikeColor=="function"&&s.setBikeColor(t),!n||typeof document>"u"||!i)return;const r=document.createElement("canvas");if(!r||typeof r.getContext!="function")return;r.width=512,r.height=128;const o=r.getContext("2d");if(!o)return;o.clearRect?.(0,0,512,128),typeof o.beginPath=="function"&&typeof o.roundRect=="function"?(o.fillStyle="rgba(16, 38, 34, 0.88)",o.beginPath(),o.roundRect(16,16,480,96,44),o.fill?.(),o.lineWidth=6,o.strokeStyle=t,o.stroke?.()):(o.fillStyle=t,o.fillRect?.(16,16,480,96)),o.fillStyle="#fff8e8",o.textAlign="center",o.textBaseline="middle";let a=50;for(o.font=`bold ${a}px sans-serif`;o.measureText?.(i)?.width>430&&a>20;)o.font=`bold ${--a}px sans-serif`;o.fillText?.(i,256,66);const c=new sc(r);c.colorSpace=wt;const l=new Ge;l.name="rider-identity";const h=new Nh(new Qa({map:c,transparent:!0,depthWrite:!1}));h.position.set(0,(s.headTopY||1.46)+.34,0),h.scale.set(1.18,.3,1),l.add(h),s.rider.add(l),s.identity=l,s.identityTag=h}function ty(s,e=!1){const t=s[0].index!==null,n=new Set(Object.keys(s[0].attributes)),i=new Set(Object.keys(s[0].morphAttributes)),r={},o={},a=s[0].morphTargetsRelative,c=new _t;let l=0;for(let h=0;h<s.length;++h){const u=s[h];let f=0;if(t!==(u.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(const d in u.attributes){if(!n.has(d))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have compatible attributes; make sure "'+d+'" attribute exists among all geometries, or in none of them.'),null;r[d]===void 0&&(r[d]=[]),r[d].push(u.attributes[d]),f++}if(f!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of attributes."),null;if(a!==u.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(const d in u.morphAttributes){if(!i.has(d))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+".  .morphAttributes must be consistent throughout all geometries."),null;o[d]===void 0&&(o[d]=[]),o[d].push(u.morphAttributes[d])}if(e){let d;if(t)d=u.index.count;else if(u.attributes.position!==void 0)d=u.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". The geometry must have either an index or a position attribute"),null;c.addGroup(l,d,h),l+=d}}if(t){let h=0;const u=[];for(let f=0;f<s.length;++f){const d=s[f].index;for(let x=0;x<d.count;++x)u.push(d.getX(x)+h);h+=s[f].attributes.position.count}c.setIndex(u)}for(const h in r){const u=$l(r[h]);if(!u)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" attribute."),null;c.setAttribute(h,u)}for(const h in o){const u=o[h][0].length;if(u===0)break;c.morphAttributes=c.morphAttributes||{},c.morphAttributes[h]=[];for(let f=0;f<u;++f){const d=[];for(let y=0;y<o[h].length;++y)d.push(o[h][y][f]);const x=$l(d);if(!x)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" morphAttribute."),null;c.morphAttributes[h].push(x)}}return c}function $l(s){let e,t,n,i=-1,r=0;for(let l=0;l<s.length;++l){const h=s[l];if(e===void 0&&(e=h.array.constructor),e!==h.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=h.itemSize),t!==h.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=h.normalized),n!==h.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(i===-1&&(i=h.gpuType),i!==h.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=h.count*t}const o=new e(r),a=new Ut(o,t,n);let c=0;for(let l=0;l<s.length;++l){const h=s[l];if(h.isInterleavedBufferAttribute){const u=c/t;for(let f=0,d=h.count;f<d;f++)for(let x=0;x<t;x++){const y=h.getComponent(f,x);a.setComponent(f+u,x,y)}}else o.set(h.array,c);c+=h.count*t}return i!==void 0&&(a.gpuType=i),a}function Kl(s,e){if(e===yd)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),s;if(e===Ca||e===yh){let t=s.getIndex();if(t===null){const o=[],a=s.getAttribute("position");if(a!==void 0){for(let c=0;c<a.count;c++)o.push(c);s.setIndex(o),t=s.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),s}const n=t.count-2,i=[];if(e===Ca)for(let o=1;o<=n;o++)i.push(t.getX(0)),i.push(t.getX(o)),i.push(t.getX(o+1));else for(let o=0;o<n;o++)o%2===0?(i.push(t.getX(o)),i.push(t.getX(o+1)),i.push(t.getX(o+2))):(i.push(t.getX(o+2)),i.push(t.getX(o+1)),i.push(t.getX(o)));i.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");const r=s.clone();return r.setIndex(i),r.clearGroups(),r}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),s}class W_ extends rs{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new K_(t)}),this.register(function(t){return new j_(t)}),this.register(function(t){return new rv(t)}),this.register(function(t){return new ov(t)}),this.register(function(t){return new av(t)}),this.register(function(t){return new Z_(t)}),this.register(function(t){return new Q_(t)}),this.register(function(t){return new ev(t)}),this.register(function(t){return new tv(t)}),this.register(function(t){return new $_(t)}),this.register(function(t){return new nv(t)}),this.register(function(t){return new J_(t)}),this.register(function(t){return new sv(t)}),this.register(function(t){return new iv(t)}),this.register(function(t){return new q_(t)}),this.register(function(t){return new cv(t)}),this.register(function(t){return new lv(t)})}load(e,t,n,i){const r=this;let o;if(this.resourcePath!=="")o=this.resourcePath;else if(this.path!==""){const l=Ps.extractUrlBase(e);o=Ps.resolveURL(l,this.path)}else o=Ps.extractUrlBase(e);this.manager.itemStart(e);const a=function(l){i?i(l):console.error(l),r.manager.itemError(e),r.manager.itemEnd(e)},c=new su(this.manager);c.setPath(this.path),c.setResponseType("arraybuffer"),c.setRequestHeader(this.requestHeader),c.setWithCredentials(this.withCredentials),c.load(e,function(l){try{r.parse(l,o,function(h){t(h),r.manager.itemEnd(e)},a)}catch(h){a(h)}},n,a)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,i){let r;const o={},a={},c=new TextDecoder;if(typeof e=="string")r=JSON.parse(e);else if(e instanceof ArrayBuffer)if(c.decode(new Uint8Array(e,0,4))===pu){try{o[Qe.KHR_BINARY_GLTF]=new hv(e)}catch(u){i&&i(u);return}r=JSON.parse(o[Qe.KHR_BINARY_GLTF].content)}else r=JSON.parse(c.decode(e));else r=e;if(r.asset===void 0||r.asset.version[0]<2){i&&i(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}const l=new Sv(r,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});l.fileLoader.setRequestHeader(this.requestHeader);for(let h=0;h<this.pluginCallbacks.length;h++){const u=this.pluginCallbacks[h](l);u.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),a[u.name]=u,o[u.name]=!0}if(r.extensionsUsed)for(let h=0;h<r.extensionsUsed.length;++h){const u=r.extensionsUsed[h],f=r.extensionsRequired||[];switch(u){case Qe.KHR_MATERIALS_UNLIT:o[u]=new Y_;break;case Qe.KHR_DRACO_MESH_COMPRESSION:o[u]=new uv(r,this.dracoLoader);break;case Qe.KHR_TEXTURE_TRANSFORM:o[u]=new dv;break;case Qe.KHR_MESH_QUANTIZATION:o[u]=new fv;break;default:f.indexOf(u)>=0&&a[u]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+u+'".')}}l.setExtensions(o),l.setPlugins(a),l.parse(n,i)}parseAsync(e,t){const n=this;return new Promise(function(i,r){n.parse(e,t,i,r)})}}function X_(){let s={};return{get:function(e){return s[e]},add:function(e,t){s[e]=t},remove:function(e){delete s[e]},removeAll:function(){s={}}}}const Qe={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"};class q_{constructor(e){this.parser=e,this.name=Qe.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){const e=this.parser,t=this.parser.json.nodes||[];for(let n=0,i=t.length;n<i;n++){const r=t[n];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){const t=this.parser,n="light:"+e;let i=t.cache.get(n);if(i)return i;const r=t.json,c=((r.extensions&&r.extensions[this.name]||{}).lights||[])[e];let l;const h=new Ve(16777215);c.color!==void 0&&h.setRGB(c.color[0],c.color[1],c.color[2],Gt);const u=c.range!==void 0?c.range:0;switch(c.type){case"directional":l=new Ip(h),l.target.position.set(0,0,-1),l.add(l.target);break;case"point":l=new Pp(h),l.distance=u;break;case"spot":l=new Rp(h),l.distance=u,c.spot=c.spot||{},c.spot.innerConeAngle=c.spot.innerConeAngle!==void 0?c.spot.innerConeAngle:0,c.spot.outerConeAngle=c.spot.outerConeAngle!==void 0?c.spot.outerConeAngle:Math.PI/4,l.angle=c.spot.outerConeAngle,l.penumbra=1-c.spot.innerConeAngle/c.spot.outerConeAngle,l.target.position.set(0,0,-1),l.add(l.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+c.type)}return l.position.set(0,0,0),vn(l,c),c.intensity!==void 0&&(l.intensity=c.intensity),l.name=t.createUniqueName(c.name||"light_"+e),i=Promise.resolve(l),t.cache.add(n,i),i}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){const t=this,n=this.parser,r=n.json.nodes[e],a=(r.extensions&&r.extensions[this.name]||{}).light;return a===void 0?null:this._loadLight(a).then(function(c){return n._getNodeRef(t.cache,a,c)})}}class Y_{constructor(){this.name=Qe.KHR_MATERIALS_UNLIT}getMaterialType(){return Tt}extendParams(e,t,n){const i=[];e.color=new Ve(1,1,1),e.opacity=1;const r=t.pbrMetallicRoughness;if(r){if(Array.isArray(r.baseColorFactor)){const o=r.baseColorFactor;e.color.setRGB(o[0],o[1],o[2],Gt),e.opacity=o[3]}r.baseColorTexture!==void 0&&i.push(n.assignTexture(e,"map",r.baseColorTexture,wt))}return Promise.all(i)}}class $_{constructor(e){this.parser=e,this.name=Qe.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=i.extensions[this.name].emissiveStrength;return r!==void 0&&(t.emissiveIntensity=r),Promise.resolve()}}class K_{constructor(e){this.parser=e,this.name=Qe.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Rn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],o=i.extensions[this.name];if(o.clearcoatFactor!==void 0&&(t.clearcoat=o.clearcoatFactor),o.clearcoatTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatMap",o.clearcoatTexture)),o.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=o.clearcoatRoughnessFactor),o.clearcoatRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatRoughnessMap",o.clearcoatRoughnessTexture)),o.clearcoatNormalTexture!==void 0&&(r.push(n.assignTexture(t,"clearcoatNormalMap",o.clearcoatNormalTexture)),o.clearcoatNormalTexture.scale!==void 0)){const a=o.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new te(a,a)}return Promise.all(r)}}class j_{constructor(e){this.parser=e,this.name=Qe.KHR_MATERIALS_DISPERSION}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Rn}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=i.extensions[this.name];return t.dispersion=r.dispersion!==void 0?r.dispersion:0,Promise.resolve()}}class J_{constructor(e){this.parser=e,this.name=Qe.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Rn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],o=i.extensions[this.name];return o.iridescenceFactor!==void 0&&(t.iridescence=o.iridescenceFactor),o.iridescenceTexture!==void 0&&r.push(n.assignTexture(t,"iridescenceMap",o.iridescenceTexture)),o.iridescenceIor!==void 0&&(t.iridescenceIOR=o.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),o.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=o.iridescenceThicknessMinimum),o.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=o.iridescenceThicknessMaximum),o.iridescenceThicknessTexture!==void 0&&r.push(n.assignTexture(t,"iridescenceThicknessMap",o.iridescenceThicknessTexture)),Promise.all(r)}}class Z_{constructor(e){this.parser=e,this.name=Qe.KHR_MATERIALS_SHEEN}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Rn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[];t.sheenColor=new Ve(0,0,0),t.sheenRoughness=0,t.sheen=1;const o=i.extensions[this.name];if(o.sheenColorFactor!==void 0){const a=o.sheenColorFactor;t.sheenColor.setRGB(a[0],a[1],a[2],Gt)}return o.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=o.sheenRoughnessFactor),o.sheenColorTexture!==void 0&&r.push(n.assignTexture(t,"sheenColorMap",o.sheenColorTexture,wt)),o.sheenRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"sheenRoughnessMap",o.sheenRoughnessTexture)),Promise.all(r)}}class Q_{constructor(e){this.parser=e,this.name=Qe.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Rn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],o=i.extensions[this.name];return o.transmissionFactor!==void 0&&(t.transmission=o.transmissionFactor),o.transmissionTexture!==void 0&&r.push(n.assignTexture(t,"transmissionMap",o.transmissionTexture)),Promise.all(r)}}class ev{constructor(e){this.parser=e,this.name=Qe.KHR_MATERIALS_VOLUME}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Rn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],o=i.extensions[this.name];t.thickness=o.thicknessFactor!==void 0?o.thicknessFactor:0,o.thicknessTexture!==void 0&&r.push(n.assignTexture(t,"thicknessMap",o.thicknessTexture)),t.attenuationDistance=o.attenuationDistance||1/0;const a=o.attenuationColor||[1,1,1];return t.attenuationColor=new Ve().setRGB(a[0],a[1],a[2],Gt),Promise.all(r)}}class tv{constructor(e){this.parser=e,this.name=Qe.KHR_MATERIALS_IOR}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Rn}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=i.extensions[this.name];return t.ior=r.ior!==void 0?r.ior:1.5,Promise.resolve()}}class nv{constructor(e){this.parser=e,this.name=Qe.KHR_MATERIALS_SPECULAR}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Rn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],o=i.extensions[this.name];t.specularIntensity=o.specularFactor!==void 0?o.specularFactor:1,o.specularTexture!==void 0&&r.push(n.assignTexture(t,"specularIntensityMap",o.specularTexture));const a=o.specularColorFactor||[1,1,1];return t.specularColor=new Ve().setRGB(a[0],a[1],a[2],Gt),o.specularColorTexture!==void 0&&r.push(n.assignTexture(t,"specularColorMap",o.specularColorTexture,wt)),Promise.all(r)}}class iv{constructor(e){this.parser=e,this.name=Qe.EXT_MATERIALS_BUMP}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Rn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],o=i.extensions[this.name];return t.bumpScale=o.bumpFactor!==void 0?o.bumpFactor:1,o.bumpTexture!==void 0&&r.push(n.assignTexture(t,"bumpMap",o.bumpTexture)),Promise.all(r)}}class sv{constructor(e){this.parser=e,this.name=Qe.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:Rn}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],o=i.extensions[this.name];return o.anisotropyStrength!==void 0&&(t.anisotropy=o.anisotropyStrength),o.anisotropyRotation!==void 0&&(t.anisotropyRotation=o.anisotropyRotation),o.anisotropyTexture!==void 0&&r.push(n.assignTexture(t,"anisotropyMap",o.anisotropyTexture)),Promise.all(r)}}class rv{constructor(e){this.parser=e,this.name=Qe.KHR_TEXTURE_BASISU}loadTexture(e){const t=this.parser,n=t.json,i=n.textures[e];if(!i.extensions||!i.extensions[this.name])return null;const r=i.extensions[this.name],o=t.options.ktx2Loader;if(!o){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,r.source,o)}}class ov{constructor(e){this.parser=e,this.name=Qe.EXT_TEXTURE_WEBP}loadTexture(e){const t=this.name,n=this.parser,i=n.json,r=i.textures[e];if(!r.extensions||!r.extensions[t])return null;const o=r.extensions[t],a=i.images[o.source];let c=n.textureLoader;if(a.uri){const l=n.options.manager.getHandler(a.uri);l!==null&&(c=l)}return n.loadTextureImage(e,o.source,c)}}class av{constructor(e){this.parser=e,this.name=Qe.EXT_TEXTURE_AVIF}loadTexture(e){const t=this.name,n=this.parser,i=n.json,r=i.textures[e];if(!r.extensions||!r.extensions[t])return null;const o=r.extensions[t],a=i.images[o.source];let c=n.textureLoader;if(a.uri){const l=n.options.manager.getHandler(a.uri);l!==null&&(c=l)}return n.loadTextureImage(e,o.source,c)}}class cv{constructor(e){this.name=Qe.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){const t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){const i=n.extensions[this.name],r=this.parser.getDependency("buffer",i.buffer),o=this.parser.options.meshoptDecoder;if(!o||!o.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return r.then(function(a){const c=i.byteOffset||0,l=i.byteLength||0,h=i.count,u=i.byteStride,f=new Uint8Array(a,c,l);return o.decodeGltfBufferAsync?o.decodeGltfBufferAsync(h,u,f,i.mode,i.filter).then(function(d){return d.buffer}):o.ready.then(function(){const d=new ArrayBuffer(h*u);return o.decodeGltfBuffer(new Uint8Array(d),h,u,f,i.mode,i.filter),d})})}else return null}}class lv{constructor(e){this.name=Qe.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){const t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;const i=t.meshes[n.mesh];for(const l of i.primitives)if(l.mode!==sn.TRIANGLES&&l.mode!==sn.TRIANGLE_STRIP&&l.mode!==sn.TRIANGLE_FAN&&l.mode!==void 0)return null;const o=n.extensions[this.name].attributes,a=[],c={};for(const l in o)a.push(this.parser.getDependency("accessor",o[l]).then(h=>(c[l]=h,c[l])));return a.length<1?null:(a.push(this.parser.createNodeMesh(e)),Promise.all(a).then(l=>{const h=l.pop(),u=h.isGroup?h.children:[h],f=l[0].count,d=[];for(const x of u){const y=new We,g=new I,m=new ni,_=new I(1,1,1),p=new Ef(x.geometry,x.material,f);for(let v=0;v<f;v++)c.TRANSLATION&&g.fromBufferAttribute(c.TRANSLATION,v),c.ROTATION&&m.fromBufferAttribute(c.ROTATION,v),c.SCALE&&_.fromBufferAttribute(c.SCALE,v),p.setMatrixAt(v,y.compose(g,m,_));for(const v in c)if(v==="_COLOR_0"){const T=c[v];p.instanceColor=new La(T.array,T.itemSize,T.normalized)}else v!=="TRANSLATION"&&v!=="ROTATION"&&v!=="SCALE"&&x.geometry.setAttribute(v,c[v]);gt.prototype.copy.call(p,x),this.parser.assignFinalMaterial(p),d.push(p)}return h.isGroup?(h.clear(),h.add(...d),h):d[0]}))}}const pu="glTF",Ms=12,jl={JSON:1313821514,BIN:5130562};class hv{constructor(e){this.name=Qe.KHR_BINARY_GLTF,this.content=null,this.body=null;const t=new DataView(e,0,Ms),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==pu)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");const i=this.header.length-Ms,r=new DataView(e,Ms);let o=0;for(;o<i;){const a=r.getUint32(o,!0);o+=4;const c=r.getUint32(o,!0);if(o+=4,c===jl.JSON){const l=new Uint8Array(e,Ms+o,a);this.content=n.decode(l)}else if(c===jl.BIN){const l=Ms+o;this.body=e.slice(l,l+a)}o+=a}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}}class uv{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=Qe.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){const n=this.json,i=this.dracoLoader,r=e.extensions[this.name].bufferView,o=e.extensions[this.name].attributes,a={},c={},l={};for(const h in o){const u=Oa[h]||h.toLowerCase();a[u]=o[h]}for(const h in e.attributes){const u=Oa[h]||h.toLowerCase();if(o[h]!==void 0){const f=n.accessors[e.attributes[h]],d=Gi[f.componentType];l[u]=d.name,c[u]=f.normalized===!0}}return t.getDependency("bufferView",r).then(function(h){return new Promise(function(u,f){i.decodeDracoFile(h,function(d){for(const x in d.attributes){const y=d.attributes[x],g=c[x];g!==void 0&&(y.normalized=g)}u(d)},a,l,Gt,f)})})}}class dv{constructor(){this.name=Qe.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0||(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),e.needsUpdate=!0),e}}class fv{constructor(){this.name=Qe.KHR_MESH_QUANTIZATION}}class mu extends Ys{constructor(e,t,n,i){super(e,t,n,i)}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=e*i*3+i;for(let o=0;o!==i;o++)t[o]=n[r+o];return t}interpolate_(e,t,n,i){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=a*2,l=a*3,h=i-t,u=(n-t)/h,f=u*u,d=f*u,x=e*l,y=x-l,g=-2*d+3*f,m=d-f,_=1-g,p=m-f+u;for(let v=0;v!==a;v++){const T=o[y+v+a],S=o[y+v+c]*h,w=o[x+v+a],L=o[x+v]*h;r[v]=_*T+p*S+g*w+m*L}return r}}const pv=new ni;class mv extends mu{interpolate_(e,t,n,i){const r=super.interpolate_(e,t,n,i);return pv.fromArray(r).normalize().toArray(r),r}}const sn={POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6},Gi={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},Jl={9728:Vt,9729:zt,9984:fh,9985:Pr,9986:Ss,9987:On},Zl={33071:bn,33648:Fr,10497:Yi},Bo={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},Oa={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},Jn={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},xv={CUBICSPLINE:void 0,LINEAR:zs,STEP:Bs},zo={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function gv(s){return s.DefaultMaterial===void 0&&(s.DefaultMaterial=new fn({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:Gn})),s.DefaultMaterial}function ui(s,e,t){for(const n in t.extensions)s[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function vn(s,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(s.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function _v(s,e,t){let n=!1,i=!1,r=!1;for(let l=0,h=e.length;l<h;l++){const u=e[l];if(u.POSITION!==void 0&&(n=!0),u.NORMAL!==void 0&&(i=!0),u.COLOR_0!==void 0&&(r=!0),n&&i&&r)break}if(!n&&!i&&!r)return Promise.resolve(s);const o=[],a=[],c=[];for(let l=0,h=e.length;l<h;l++){const u=e[l];if(n){const f=u.POSITION!==void 0?t.getDependency("accessor",u.POSITION):s.attributes.position;o.push(f)}if(i){const f=u.NORMAL!==void 0?t.getDependency("accessor",u.NORMAL):s.attributes.normal;a.push(f)}if(r){const f=u.COLOR_0!==void 0?t.getDependency("accessor",u.COLOR_0):s.attributes.color;c.push(f)}}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(c)]).then(function(l){const h=l[0],u=l[1],f=l[2];return n&&(s.morphAttributes.position=h),i&&(s.morphAttributes.normal=u),r&&(s.morphAttributes.color=f),s.morphTargetsRelative=!0,s})}function vv(s,e){if(s.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)s.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){const t=e.extras.targetNames;if(s.morphTargetInfluences.length===t.length){s.morphTargetDictionary={};for(let n=0,i=t.length;n<i;n++)s.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function yv(s){let e;const t=s.extensions&&s.extensions[Qe.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+ko(t.attributes):e=s.indices+":"+ko(s.attributes)+":"+s.mode,s.targets!==void 0)for(let n=0,i=s.targets.length;n<i;n++)e+=":"+ko(s.targets[n]);return e}function ko(s){let e="";const t=Object.keys(s).sort();for(let n=0,i=t.length;n<i;n++)e+=t[n]+":"+s[t[n]]+";";return e}function Ba(s){switch(s){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function Mv(s){return s.search(/\.jpe?g($|\?)/i)>0||s.search(/^data\:image\/jpeg/)===0?"image/jpeg":s.search(/\.webp($|\?)/i)>0||s.search(/^data\:image\/webp/)===0?"image/webp":s.search(/\.ktx2($|\?)/i)>0||s.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}const bv=new We;class Sv{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new X_,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,i=-1,r=!1,o=-1;if(typeof navigator<"u"){const a=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(a)===!0;const c=a.match(/Version\/(\d+)/);i=n&&c?parseInt(c[1],10):-1,r=a.indexOf("Firefox")>-1,o=r?a.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||n&&i<17||r&&o<98?this.textureLoader=new Ap(this.options.manager):this.textureLoader=new Dp(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new su(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){const n=this,i=this.json,r=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(o){return o._markDefs&&o._markDefs()}),Promise.all(this._invokeAll(function(o){return o.beforeRoot&&o.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(o){const a={scene:o[0][i.scene||0],scenes:o[0],animations:o[1],cameras:o[2],asset:i.asset,parser:n,userData:{}};return ui(r,a,i),vn(a,i),Promise.all(n._invokeAll(function(c){return c.afterRoot&&c.afterRoot(a)})).then(function(){for(const c of a.scenes)c.updateMatrixWorld();e(a)})}).catch(t)}_markDefs(){const e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let i=0,r=t.length;i<r;i++){const o=t[i].joints;for(let a=0,c=o.length;a<c;a++)e[o[a]].isBone=!0}for(let i=0,r=e.length;i<r;i++){const o=e[i];o.mesh!==void 0&&(this._addNodeRef(this.meshCache,o.mesh),o.skin!==void 0&&(n[o.mesh].isSkinnedMesh=!0)),o.camera!==void 0&&this._addNodeRef(this.cameraCache,o.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;const i=n.clone(),r=(o,a)=>{const c=this.associations.get(o);c!=null&&this.associations.set(a,c);for(const[l,h]of o.children.entries())r(h,a.children[l])};return r(n,i),i.name+="_instance_"+e.uses[t]++,i}_invokeOne(e){const t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){const i=e(t[n]);if(i)return i}return null}_invokeAll(e){const t=Object.values(this.plugins);t.unshift(this);const n=[];for(let i=0;i<t.length;i++){const r=e(t[i]);r&&n.push(r)}return n}getDependency(e,t){const n=e+":"+t;let i=this.cache.get(n);if(!i){switch(e){case"scene":i=this.loadScene(t);break;case"node":i=this._invokeOne(function(r){return r.loadNode&&r.loadNode(t)});break;case"mesh":i=this._invokeOne(function(r){return r.loadMesh&&r.loadMesh(t)});break;case"accessor":i=this.loadAccessor(t);break;case"bufferView":i=this._invokeOne(function(r){return r.loadBufferView&&r.loadBufferView(t)});break;case"buffer":i=this.loadBuffer(t);break;case"material":i=this._invokeOne(function(r){return r.loadMaterial&&r.loadMaterial(t)});break;case"texture":i=this._invokeOne(function(r){return r.loadTexture&&r.loadTexture(t)});break;case"skin":i=this.loadSkin(t);break;case"animation":i=this._invokeOne(function(r){return r.loadAnimation&&r.loadAnimation(t)});break;case"camera":i=this.loadCamera(t);break;default:if(i=this._invokeOne(function(r){return r!=this&&r.getDependency&&r.getDependency(e,t)}),!i)throw new Error("Unknown type: "+e);break}this.cache.add(n,i)}return i}getDependencies(e){let t=this.cache.get(e);if(!t){const n=this,i=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(i.map(function(r,o){return n.getDependency(e,o)})),this.cache.add(e,t)}return t}loadBuffer(e){const t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[Qe.KHR_BINARY_GLTF].body);const i=this.options;return new Promise(function(r,o){n.load(Ps.resolveURL(t.uri,i.path),r,void 0,function(){o(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){const t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){const i=t.byteLength||0,r=t.byteOffset||0;return n.slice(r,r+i)})}loadAccessor(e){const t=this,n=this.json,i=this.json.accessors[e];if(i.bufferView===void 0&&i.sparse===void 0){const o=Bo[i.type],a=Gi[i.componentType],c=i.normalized===!0,l=new a(i.count*o);return Promise.resolve(new Ut(l,o,c))}const r=[];return i.bufferView!==void 0?r.push(this.getDependency("bufferView",i.bufferView)):r.push(null),i.sparse!==void 0&&(r.push(this.getDependency("bufferView",i.sparse.indices.bufferView)),r.push(this.getDependency("bufferView",i.sparse.values.bufferView))),Promise.all(r).then(function(o){const a=o[0],c=Bo[i.type],l=Gi[i.componentType],h=l.BYTES_PER_ELEMENT,u=h*c,f=i.byteOffset||0,d=i.bufferView!==void 0?n.bufferViews[i.bufferView].byteStride:void 0,x=i.normalized===!0;let y,g;if(d&&d!==u){const m=Math.floor(f/d),_="InterleavedBuffer:"+i.bufferView+":"+i.componentType+":"+m+":"+i.count;let p=t.cache.get(_);p||(y=new l(a,m*d,i.count*d/h),p=new Ih(y,d/h),t.cache.add(_,p)),g=new Gs(p,c,f%d/h,x)}else a===null?y=new l(i.count*c):y=new l(a,f,i.count*c),g=new Ut(y,c,x);if(i.sparse!==void 0){const m=Bo.SCALAR,_=Gi[i.sparse.indices.componentType],p=i.sparse.indices.byteOffset||0,v=i.sparse.values.byteOffset||0,T=new _(o[1],p,i.sparse.count*m),S=new l(o[2],v,i.sparse.count*c);a!==null&&(g=new Ut(g.array.slice(),g.itemSize,g.normalized)),g.normalized=!1;for(let w=0,L=T.length;w<L;w++){const b=T[w];if(g.setX(b,S[w*c]),c>=2&&g.setY(b,S[w*c+1]),c>=3&&g.setZ(b,S[w*c+2]),c>=4&&g.setW(b,S[w*c+3]),c>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}g.normalized=x}return g})}loadTexture(e){const t=this.json,n=this.options,r=t.textures[e].source,o=t.images[r];let a=this.textureLoader;if(o.uri){const c=n.manager.getHandler(o.uri);c!==null&&(a=c)}return this.loadTextureImage(e,r,a)}loadTextureImage(e,t,n){const i=this,r=this.json,o=r.textures[e],a=r.images[t],c=(a.uri||a.bufferView)+":"+o.sampler;if(this.textureCache[c])return this.textureCache[c];const l=this.loadImageSource(t,n).then(function(h){h.flipY=!1,h.name=o.name||a.name||"",h.name===""&&typeof a.uri=="string"&&a.uri.startsWith("data:image/")===!1&&(h.name=a.uri);const f=(r.samplers||{})[o.sampler]||{};return h.magFilter=Jl[f.magFilter]||zt,h.minFilter=Jl[f.minFilter]||On,h.wrapS=Zl[f.wrapS]||Yi,h.wrapT=Zl[f.wrapT]||Yi,h.generateMipmaps=!h.isCompressedTexture&&h.minFilter!==Vt&&h.minFilter!==zt,i.associations.set(h,{textures:e}),h}).catch(function(){return null});return this.textureCache[c]=l,l}loadImageSource(e,t){const n=this,i=this.json,r=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(u=>u.clone());const o=i.images[e],a=self.URL||self.webkitURL;let c=o.uri||"",l=!1;if(o.bufferView!==void 0)c=n.getDependency("bufferView",o.bufferView).then(function(u){l=!0;const f=new Blob([u],{type:o.mimeType});return c=a.createObjectURL(f),c});else if(o.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");const h=Promise.resolve(c).then(function(u){return new Promise(function(f,d){let x=f;t.isImageBitmapLoader===!0&&(x=function(y){const g=new Rt(y);g.needsUpdate=!0,f(g)}),t.load(Ps.resolveURL(u,r.path),x,void 0,d)})}).then(function(u){return l===!0&&a.revokeObjectURL(c),vn(u,o),u.userData.mimeType=o.mimeType||Mv(o.uri),u}).catch(function(u){throw console.error("THREE.GLTFLoader: Couldn't load texture",c),u});return this.sourceCache[e]=h,h}assignTexture(e,t,n,i){const r=this;return this.getDependency("texture",n.index).then(function(o){if(!o)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(o=o.clone(),o.channel=n.texCoord),r.extensions[Qe.KHR_TEXTURE_TRANSFORM]){const a=n.extensions!==void 0?n.extensions[Qe.KHR_TEXTURE_TRANSFORM]:void 0;if(a){const c=r.associations.get(o);o=r.extensions[Qe.KHR_TEXTURE_TRANSFORM].extendTexture(o,a),r.associations.set(o,c)}}return i!==void 0&&(o.colorSpace=i),e[t]=o,o})}assignFinalMaterial(e){const t=e.geometry;let n=e.material;const i=t.attributes.tangent===void 0,r=t.attributes.color!==void 0,o=t.attributes.normal===void 0;if(e.isPoints){const a="PointsMaterial:"+n.uuid;let c=this.cache.get(a);c||(c=new Oh,xn.prototype.copy.call(c,n),c.color.copy(n.color),c.map=n.map,c.sizeAttenuation=!1,this.cache.add(a,c)),n=c}else if(e.isLine){const a="LineBasicMaterial:"+n.uuid;let c=this.cache.get(a);c||(c=new Fh,xn.prototype.copy.call(c,n),c.color.copy(n.color),c.map=n.map,this.cache.add(a,c)),n=c}if(i||r||o){let a="ClonedMaterial:"+n.uuid+":";i&&(a+="derivative-tangents:"),r&&(a+="vertex-colors:"),o&&(a+="flat-shading:");let c=this.cache.get(a);c||(c=n.clone(),r&&(c.vertexColors=!0),o&&(c.flatShading=!0),i&&(c.normalScale&&(c.normalScale.y*=-1),c.clearcoatNormalScale&&(c.clearcoatNormalScale.y*=-1)),this.cache.add(a,c),this.associations.set(c,this.associations.get(n))),n=c}e.material=n}getMaterialType(){return fn}loadMaterial(e){const t=this,n=this.json,i=this.extensions,r=n.materials[e];let o;const a={},c=r.extensions||{},l=[];if(c[Qe.KHR_MATERIALS_UNLIT]){const u=i[Qe.KHR_MATERIALS_UNLIT];o=u.getMaterialType(),l.push(u.extendParams(a,r,t))}else{const u=r.pbrMetallicRoughness||{};if(a.color=new Ve(1,1,1),a.opacity=1,Array.isArray(u.baseColorFactor)){const f=u.baseColorFactor;a.color.setRGB(f[0],f[1],f[2],Gt),a.opacity=f[3]}u.baseColorTexture!==void 0&&l.push(t.assignTexture(a,"map",u.baseColorTexture,wt)),a.metalness=u.metallicFactor!==void 0?u.metallicFactor:1,a.roughness=u.roughnessFactor!==void 0?u.roughnessFactor:1,u.metallicRoughnessTexture!==void 0&&(l.push(t.assignTexture(a,"metalnessMap",u.metallicRoughnessTexture)),l.push(t.assignTexture(a,"roughnessMap",u.metallicRoughnessTexture))),o=this._invokeOne(function(f){return f.getMaterialType&&f.getMaterialType(e)}),l.push(Promise.all(this._invokeAll(function(f){return f.extendMaterialParams&&f.extendMaterialParams(e,a)})))}r.doubleSided===!0&&(a.side=Et);const h=r.alphaMode||zo.OPAQUE;if(h===zo.BLEND?(a.transparent=!0,a.depthWrite=!1):(a.transparent=!1,h===zo.MASK&&(a.alphaTest=r.alphaCutoff!==void 0?r.alphaCutoff:.5)),r.normalTexture!==void 0&&o!==Tt&&(l.push(t.assignTexture(a,"normalMap",r.normalTexture)),a.normalScale=new te(1,1),r.normalTexture.scale!==void 0)){const u=r.normalTexture.scale;a.normalScale.set(u,u)}if(r.occlusionTexture!==void 0&&o!==Tt&&(l.push(t.assignTexture(a,"aoMap",r.occlusionTexture)),r.occlusionTexture.strength!==void 0&&(a.aoMapIntensity=r.occlusionTexture.strength)),r.emissiveFactor!==void 0&&o!==Tt){const u=r.emissiveFactor;a.emissive=new Ve().setRGB(u[0],u[1],u[2],Gt)}return r.emissiveTexture!==void 0&&o!==Tt&&l.push(t.assignTexture(a,"emissiveMap",r.emissiveTexture,wt)),Promise.all(l).then(function(){const u=new o(a);return r.name&&(u.name=r.name),vn(u,r),t.associations.set(u,{materials:e}),r.extensions&&ui(i,u,r),u})}createUniqueName(e){const t=lt.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){const t=this,n=this.extensions,i=this.primitiveCache;function r(a){return n[Qe.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(a,t).then(function(c){return Ql(c,a,t)})}const o=[];for(let a=0,c=e.length;a<c;a++){const l=e[a],h=yv(l),u=i[h];if(u)o.push(u.promise);else{let f;l.extensions&&l.extensions[Qe.KHR_DRACO_MESH_COMPRESSION]?f=r(l):f=Ql(new _t,l,t),i[h]={primitive:l,promise:f},o.push(f)}}return Promise.all(o)}loadMesh(e){const t=this,n=this.json,i=this.extensions,r=n.meshes[e],o=r.primitives,a=[];for(let c=0,l=o.length;c<l;c++){const h=o[c].material===void 0?gv(this.cache):this.getDependency("material",o[c].material);a.push(h)}return a.push(t.loadGeometries(o)),Promise.all(a).then(function(c){const l=c.slice(0,c.length-1),h=c[c.length-1],u=[];for(let d=0,x=h.length;d<x;d++){const y=h[d],g=o[d];let m;const _=l[d];if(g.mode===sn.TRIANGLES||g.mode===sn.TRIANGLE_STRIP||g.mode===sn.TRIANGLE_FAN||g.mode===void 0)m=r.isSkinnedMesh===!0?new bf(y,_):new Ze(y,_),m.isSkinnedMesh===!0&&m.normalizeSkinWeights(),g.mode===sn.TRIANGLE_STRIP?m.geometry=Kl(m.geometry,yh):g.mode===sn.TRIANGLE_FAN&&(m.geometry=Kl(m.geometry,Ca));else if(g.mode===sn.LINES)m=new Cf(y,_);else if(g.mode===sn.LINE_STRIP)m=new ic(y,_);else if(g.mode===sn.LINE_LOOP)m=new Pf(y,_);else if(g.mode===sn.POINTS)m=new Lf(y,_);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+g.mode);Object.keys(m.geometry.morphAttributes).length>0&&vv(m,r),m.name=t.createUniqueName(r.name||"mesh_"+e),vn(m,r),g.extensions&&ui(i,m,g),t.assignFinalMaterial(m),u.push(m)}for(let d=0,x=u.length;d<x;d++)t.associations.set(u[d],{meshes:e,primitives:d});if(u.length===1)return r.extensions&&ui(i,u[0],r),u[0];const f=new Ge;r.extensions&&ui(i,f,r),t.associations.set(f,{meshes:e});for(let d=0,x=u.length;d<x;d++)f.add(u[d]);return f})}loadCamera(e){let t;const n=this.json.cameras[e],i=n[n.type];if(!i){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new Xt(Kd.radToDeg(i.yfov),i.aspectRatio||1,i.znear||1,i.zfar||2e6):n.type==="orthographic"&&(t=new cc(-i.xmag,i.xmag,i.ymag,-i.ymag,i.znear,i.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),vn(t,n),Promise.resolve(t)}loadSkin(e){const t=this.json.skins[e],n=[];for(let i=0,r=t.joints.length;i<r;i++)n.push(this._loadNodeShallow(t.joints[i]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(i){const r=i.pop(),o=i,a=[],c=[];for(let l=0,h=o.length;l<h;l++){const u=o[l];if(u){a.push(u);const f=new We;r!==null&&f.fromArray(r.array,l*16),c.push(f)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[l])}return new tc(a,c)})}loadAnimation(e){const t=this.json,n=this,i=t.animations[e],r=i.name?i.name:"animation_"+e,o=[],a=[],c=[],l=[],h=[];for(let u=0,f=i.channels.length;u<f;u++){const d=i.channels[u],x=i.samplers[d.sampler],y=d.target,g=y.node,m=i.parameters!==void 0?i.parameters[x.input]:x.input,_=i.parameters!==void 0?i.parameters[x.output]:x.output;y.node!==void 0&&(o.push(this.getDependency("node",g)),a.push(this.getDependency("accessor",m)),c.push(this.getDependency("accessor",_)),l.push(x),h.push(y))}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(c),Promise.all(l),Promise.all(h)]).then(function(u){const f=u[0],d=u[1],x=u[2],y=u[3],g=u[4],m=[];for(let p=0,v=f.length;p<v;p++){const T=f[p],S=d[p],w=x[p],L=y[p],b=g[p];if(T===void 0)continue;T.updateMatrix&&T.updateMatrix();const M=n._createAnimationTracks(T,S,w,L,b);if(M)for(let C=0;C<M.length;C++)m.push(M[C])}const _=new vp(r,void 0,m);return vn(_,i),_})}createNodeMesh(e){const t=this.json,n=this,i=t.nodes[e];return i.mesh===void 0?null:n.getDependency("mesh",i.mesh).then(function(r){const o=n._getNodeRef(n.meshCache,i.mesh,r);return i.weights!==void 0&&o.traverse(function(a){if(a.isMesh)for(let c=0,l=i.weights.length;c<l;c++)a.morphTargetInfluences[c]=i.weights[c]}),o})}loadNode(e){const t=this.json,n=this,i=t.nodes[e],r=n._loadNodeShallow(e),o=[],a=i.children||[];for(let l=0,h=a.length;l<h;l++)o.push(n.getDependency("node",a[l]));const c=i.skin===void 0?Promise.resolve(null):n.getDependency("skin",i.skin);return Promise.all([r,Promise.all(o),c]).then(function(l){const h=l[0],u=l[1],f=l[2];f!==null&&h.traverse(function(d){d.isSkinnedMesh&&d.bind(f,bv)});for(let d=0,x=u.length;d<x;d++)h.add(u[d]);return h})}_loadNodeShallow(e){const t=this.json,n=this.extensions,i=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];const r=t.nodes[e],o=r.name?i.createUniqueName(r.name):"",a=[],c=i._invokeOne(function(l){return l.createNodeMesh&&l.createNodeMesh(e)});return c&&a.push(c),r.camera!==void 0&&a.push(i.getDependency("camera",r.camera).then(function(l){return i._getNodeRef(i.cameraCache,r.camera,l)})),i._invokeAll(function(l){return l.createNodeAttachment&&l.createNodeAttachment(e)}).forEach(function(l){a.push(l)}),this.nodeCache[e]=Promise.all(a).then(function(l){let h;if(r.isBone===!0?h=new Uh:l.length>1?h=new Ge:l.length===1?h=l[0]:h=new gt,h!==l[0])for(let u=0,f=l.length;u<f;u++)h.add(l[u]);if(r.name&&(h.userData.name=r.name,h.name=o),vn(h,r),r.extensions&&ui(n,h,r),r.matrix!==void 0){const u=new We;u.fromArray(r.matrix),h.applyMatrix4(u)}else r.translation!==void 0&&h.position.fromArray(r.translation),r.rotation!==void 0&&h.quaternion.fromArray(r.rotation),r.scale!==void 0&&h.scale.fromArray(r.scale);if(!i.associations.has(h))i.associations.set(h,{});else if(r.mesh!==void 0&&i.meshCache.refs[r.mesh]>1){const u=i.associations.get(h);i.associations.set(h,{...u})}return i.associations.get(h).nodes=e,h}),this.nodeCache[e]}loadScene(e){const t=this.extensions,n=this.json.scenes[e],i=this,r=new Ge;n.name&&(r.name=i.createUniqueName(n.name)),vn(r,n),n.extensions&&ui(t,r,n);const o=n.nodes||[],a=[];for(let c=0,l=o.length;c<l;c++)a.push(i.getDependency("node",o[c]));return Promise.all(a).then(function(c){for(let h=0,u=c.length;h<u;h++)r.add(c[h]);const l=h=>{const u=new Map;for(const[f,d]of i.associations)(f instanceof xn||f instanceof Rt)&&u.set(f,d);return h.traverse(f=>{const d=i.associations.get(f);d!=null&&u.set(f,d)}),u};return i.associations=l(r),r})}_createAnimationTracks(e,t,n,i,r){const o=[],a=e.name?e.name:e.uuid,c=[];Jn[r.path]===Jn.weights?e.traverse(function(f){f.morphTargetInfluences&&c.push(f.name?f.name:f.uuid)}):c.push(a);let l;switch(Jn[r.path]){case Jn.weights:l=Ji;break;case Jn.rotation:l=Zi;break;case Jn.translation:case Jn.scale:l=Qi;break;default:n.itemSize===1?l=Ji:l=Qi;break}const h=i.interpolation!==void 0?xv[i.interpolation]:zs,u=this._getArrayFromAccessor(n);for(let f=0,d=c.length;f<d;f++){const x=new l(c[f]+"."+Jn[r.path],t.array,u,h);i.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(x),o.push(x)}return o}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){const n=Ba(t.constructor),i=new Float32Array(t.length);for(let r=0,o=t.length;r<o;r++)i[r]=t[r]*n;t=i}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){const i=this instanceof Zi?mv:mu;return new i(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}}function Tv(s,e,t){const n=e.attributes,i=new Wn;if(n.POSITION!==void 0){const a=t.json.accessors[n.POSITION],c=a.min,l=a.max;if(c!==void 0&&l!==void 0){if(i.set(new I(c[0],c[1],c[2]),new I(l[0],l[1],l[2])),a.normalized){const h=Ba(Gi[a.componentType]);i.min.multiplyScalar(h),i.max.multiplyScalar(h)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;const r=e.targets;if(r!==void 0){const a=new I,c=new I;for(let l=0,h=r.length;l<h;l++){const u=r[l];if(u.POSITION!==void 0){const f=t.json.accessors[u.POSITION],d=f.min,x=f.max;if(d!==void 0&&x!==void 0){if(c.setX(Math.max(Math.abs(d[0]),Math.abs(x[0]))),c.setY(Math.max(Math.abs(d[1]),Math.abs(x[1]))),c.setZ(Math.max(Math.abs(d[2]),Math.abs(x[2]))),f.normalized){const y=Ba(Gi[f.componentType]);c.multiplyScalar(y)}a.max(c)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}i.expandByVector(a)}s.boundingBox=i;const o=new An;i.getCenter(o.center),o.radius=i.min.distanceTo(i.max)/2,s.boundingSphere=o}function Ql(s,e,t){const n=e.attributes,i=[];function r(o,a){return t.getDependency("accessor",o).then(function(c){s.setAttribute(a,c)})}for(const o in n){const a=Oa[o]||o.toLowerCase();a in s.attributes||i.push(r(n[o],a))}if(e.indices!==void 0&&!s.index){const o=t.getDependency("accessor",e.indices).then(function(a){s.setIndex(a)});i.push(o)}return nt.workingColorSpace!==Gt&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${nt.workingColorSpace}" not supported.`),vn(s,e),Tv(s,e,t),Promise.all(i).then(function(){return e.targets!==void 0?_v(s,e.targets,t):s})}const Rr=new Map,es=new WeakSet;class ny{loadAsync(e){return Ev(e)}}function xu(s){es.add(s);for(const e of Object.values(s))e?.isTexture&&es.add(e)}function uc(s){return s&&(es.add(s),s.isMaterial&&xu(s),s)}function Ev(s){return Rr.has(s)||Rr.set(s,new W_().loadAsync(s).then(e=>(e.scene.traverse(t=>{t.geometry&&es.add(t.geometry);for(const n of Array.isArray(t.material)?t.material:t.material?[t.material]:[])xu(n)}),e)).catch(e=>{throw Rr.delete(s),e})),Rr.get(s)}function Av(s,e){const t=new Set,n=new Set;return((r,o)=>r.traverse(a=>{a.geometry&&o.add(a.geometry);for(const c of Array.isArray(a.material)?a.material:a.material?[a.material]:[]){o.add(c);for(const l of Object.values(c))l?.isTexture&&o.add(l)}}))(e,t),s.traverse(r=>{for(const o of[r.geometry,...Array.isArray(r.material)?r.material:r.material?[r.material]:[]])if(!(!o||es.has(o)||t.has(o)||n.has(o))){if(o.isMaterial)for(const a of Object.values(o))a?.isTexture&&!es.has(a)&&!t.has(a)&&!n.has(a)&&(a.dispose(),n.add(a));o.dispose(),n.add(o)}r.isInstancedMesh&&r.dispose(),r.shadow?.map?.dispose()}),s.clear(),n.size}const wv=new Map(rh.map(s=>[s.id,s])),eh=new Map,Vo=new Map,Go=new Map,th=new Map;function Rv(s){return wv.get(Ds(s))||rh[0]}function Hi(s,e=.68,t=.04,n={}){return new fn({color:s,roughness:e,metalness:t,...n})}function ft(s,e=.68,t=.04,n="",i=null){const r=`${s}|${e}|${t}|${n}`;let o=eh.get(r);return o||(o=uc(Hi(s,e,t,i?i():{})),eh.set(r,o)),o}function gu(s,e){if(typeof document>"u")return null;const t=document.createElement("canvas");if(!t||typeof t.getContext!="function")return null;t.width=s,t.height=e;const n=t.getContext("2d");return n?{canvas:t,ctx:n}:null}function nn(s,e,t,n,i,r=0){return typeof s.beginPath!="function"?!1:typeof s.ellipse=="function"?(s.beginPath(),s.ellipse(e,t,n,i,r,0,Math.PI*2),!0):typeof s.arc=="function"?(s.beginPath(),s.arc(e,t,(n+i)*.5,0,Math.PI*2),!0):!1}function nh(s,e,t,n){return typeof s.beginPath!="function"||typeof s.arc!="function"?!1:(s.beginPath(),s.arc(e,t,n,0,Math.PI*2),!0)}function Cv(s,e,t,n,i,r){if(typeof s.beginPath!="function"||typeof s.moveTo!="function"||typeof s.lineTo!="function")return!1;let o=Math.PI/2*3;const a=Math.PI/n;s.beginPath(),s.moveTo(e,t-i);for(let c=0;c<n;c++)s.lineTo(e+Math.cos(o)*i,t+Math.sin(o)*i),o+=a,s.lineTo(e+Math.cos(o)*r,t+Math.sin(o)*r),o+=a;return s.lineTo(e,t-i),s.closePath?.(),!0}function _u(s,e=!0){const t=new sc(s);return e&&(t.colorSpace=wt),t.needsUpdate=!0,uc(t)}function vu(s="#1f5cb4",e="#ffd24a"){const t=`${s}|${e}`;if(Vo.has(t))return Vo.get(t);const n=gu(256,256);if(!n)return null;const{canvas:i,ctx:r}=n;r.fillStyle=s,r.fillRect?.(0,0,256,256),r.fillStyle="#f2b830",r.fillRect?.(0,206,256,22),r.fillStyle=e,Cv(r,128,114,5,56,23)?r.fill?.():r.fillRect?.(100,88,56,56);const o=_u(i);return Vo.set(t,o),o}function yu(s){const e=Ds(s);if(Go.has(e))return Go.get(e);const t=gu(512,256);if(!t)return null;const{canvas:n,ctx:i}=t,r={boy:"#ffd9be",girl:"#ffe0c8",dog:"#f3be72",cat:"#f8aa44",cow:"#e7b15e",buffalo:"#4c545f"};if(i.fillStyle=r[e]||"#ffd9be",i.fillRect?.(0,0,512,256),e==="cat"){i.fillStyle="#c96f1e";for(const[f,d,x]of[[256,12,34],[230,9,24],[282,9,24]])i.fillRect?.(f-d/2,18,d,x)}else e==="dog"?(i.fillStyle="#fbe4be",nn(i,256,178,86,56)&&i.fill?.()):e==="cow"?(i.fillStyle="#8a5228",nn(i,186,98,42,36,-.3)&&i.fill?.(),i.fillStyle="#fde7cb",nn(i,256,182,92,54)&&i.fill?.()):e==="buffalo"&&(i.fillStyle="#333942",nn(i,256,184,88,52)&&i.fill?.());const o=214,a=298,c=e==="boy"||e==="girl"?132:118;i.fillStyle=e==="buffalo"?"rgba(244, 134, 128, 0.42)":"rgba(255, 132, 118, 0.52)";for(const f of[178,334])nn(i,f,c+34,24,14)&&i.fill?.();const l=e==="boy"||e==="girl"?"#5f341b":e==="cat"?"#4a7b2c":"#2b1d16",h=typeof i.beginPath=="function"&&typeof i.moveTo=="function"&&typeof i.lineTo=="function"&&typeof i.stroke=="function";for(const[f,d]of[[o,!1],[a,!0]]){if(i.fillStyle="#ffffff",nn(i,f,c,21,24)&&i.fill?.(),i.fillStyle="#221612",nn(i,f,c+1,17,21)&&i.fill?.(),i.fillStyle=l,nn(i,f,c+6,13,12)&&i.fill?.(),i.fillStyle="#140d0a",nn(i,f,c-1,9,11)&&i.fill?.(),i.fillStyle="#ffffff",nh(i,f-5,c-8,6.2)&&i.fill?.(),nh(i,f+5,c+7,2.8)&&i.fill?.(),i.strokeStyle=e==="buffalo"?"#1e2228":"#3a251c",i.lineWidth=e==="girl"?4.5:3.5,i.lineCap="round",h&&typeof i.arc=="function"&&(i.beginPath(),i.arc(f,c+3,22,Math.PI*1.15,Math.PI*1.85),i.stroke()),h&&e==="girl"){i.beginPath();const x=d?1:-1;i.moveTo(f+x*18,c-10),i.lineTo(f+x*26,c-16),i.stroke()}h&&(e==="boy"||e==="girl")&&(i.strokeStyle="#3c2820",i.lineWidth=4,i.beginPath(),i.moveTo(f-14,c-30),i.lineTo(f+14,c-32),i.stroke())}if(e==="boy"||e==="girl")i.fillStyle="#e2a286",nn(i,256,160,4.5,3)&&i.fill?.(),i.fillStyle="#c94c4c",h&&typeof i.quadraticCurveTo=="function"?(i.beginPath(),i.moveTo(240,177),i.quadraticCurveTo(256,198,272,177),i.quadraticCurveTo(256,181,240,177),i.fill?.(),i.fillStyle="#ff9797",nn(i,256,184,7,4)&&i.fill?.()):nn(i,256,181,14,7)&&i.fill?.();else if(h&&e==="cat"){i.strokeStyle="#8a511c",i.lineWidth=2.6;for(const f of[-1,1])for(const d of[-8,3])i.beginPath(),i.moveTo(256+f*42,160+d),i.lineTo(256+f*86,154+d*1.4),i.stroke()}const u=_u(n);return Go.set(e,u),u}function _e(s,e,t,n=0,i=0,r=0,o=0,a=0,c=0,l=1,h=1,u=1){const f=new Ze(e,t);return f.position.set(n,i,r),f.rotation.set(o,a,c),f.scale.set(l,h,u),f.castShadow=!0,f.receiveShadow=!0,s.add(f),f}function Zt(s,e,t,n,i){const r=new I(...e),a=new I(...t).clone().sub(r),c=a.length();if(c<1e-4)return null;const l=`${n}|${c.toFixed(4)}`;let h=th.get(l);h||(h=uc(new Nt(n,n,c,12)),th.set(l,h));const u=new Ze(h,i);return u.position.copy(r).addScaledVector(a,.5),u.quaternion.setFromUnitVectors(new I(0,1,0),a.normalize()),u.castShadow=!0,u.receiveShadow=!0,s.add(u),u}function Pv(s="#2477d4"){const e=new Ge;e.name="chibi-bicycle";const t=Hi(s,.28,.48),n=ft("#d8e0e6",.22,.85),i=ft("#262b30",.85,.05),r=ft("#2f353b",.82,.05),o=ft("#e8a838",.52,.08),a=vu(s,"#ffda52"),c=a?ft("#ffffff",.42,.2,`star:${s}|#ffda52`,()=>({map:a})):t,l=[],h=.215,u=.028;for(const[w,L]of[-.43,.43].entries()){const b=new Ge;b.position.set(0,.243,L),e.add(b);const M=new Ge;b.add(M),l.push(M);const C=new Ze(new kt(h,u,10,32),i);C.rotation.y=Math.PI/2,M.add(C);const D=new Ze(new kt(h-.022,.01,8,28),n);D.rotation.y=Math.PI/2,M.add(D),_e(M,new Nt(.024,.024,.07,12),n,0,0,0,0,0,Math.PI/2);for(let k=0;k<10;k++){const z=k*Math.PI/5;Zt(M,[0,0,0],[0,Math.sin(z)*(h-.02),Math.cos(z)*(h-.02)],.004,n)}const F=new Ze(new kt(h+.044,.018,8,18,Math.PI*.72),t);F.rotation.y=Math.PI/2,F.rotation.z=Math.PI*.14,b.add(F),w===1&&(e.frontAxle=b)}const f=[0,.243,-.43],d=[0,.26,-.05],x=[0,.56,-.17],y=[0,.45,-.13],g=[0,.48,.25],m=[0,.62,.22];Zt(e,f,d,.018,t),Zt(e,f,y,.016,t),Zt(e,d,x,.021,t),Zt(e,d,g,.022,t),Zt(e,y,m,.02,t),Zt(e,g,m,.022,t);const _=_e(e,new Yt(.055,.14,.36),c,.042,.255,-.23,.04,0,0);_.name="bike-chain-guard",Zt(e,x,[0,.62,-.17],.015,n),_e(e,new it(.11,14,10),o,0,.635,-.18,0,0,0,.95,.34,1.25);const p=new Ge;p.position.set(0,.62,.22),e.add(p);for(const w of[-.045,.045])Zt(p,[w*.6,-.14,.03],[w,-.377,.21],.014,t);Zt(p,[0,0,0],[0,.13,-.02],.016,n),Zt(p,[-.17,.13,-.02],[.17,.13,-.02],.014,n);for(const w of[-1,1])Zt(p,[w*.17,.13,-.02],[w*.2,.155,-.06],.014,n),_e(p,new Nt(.019,.019,.085,10),r,w*.205,.16,-.065,Math.PI/2.2,0,w*.25);_e(e,new qr(.035),Hi("#ffda52",.35,.2),0,.56,.255,0,0,0,1,1,.3),_e(p,new it(.024,10,8),Hi("#ffd050",.25,.7),.12,.155,-.03);const v=new Ge;v.position.set(0,.26,-.05),e.add(v),_e(v,new Nt(.068,.068,.016,16),n,0,0,0,0,0,Math.PI/2),Zt(v,[-.145,-.09,0],[.145,.09,0],.012,n);const T=_e(v,new Yt(.065,.022,.085),r,-.145,-.09,0),S=_e(v,new Yt(.065,.022,.085),r,.145,.09,0);return e.traverse(w=>{w.isMesh&&(w.castShadow=!0,w.receiveShadow=!0)}),{group:e,wheels:l,crank:v,pedalL:T,pedalR:S,steerPivot:p,setColor(w){t.color.set(w)}}}function Lv(s,e="#2260b8"){const t=new Ge;t.name="chibi-backpack";const n=ft(e,.72,.04),i=ft("#f2bf38",.52,.1),r=vu(e,"#ffd654"),o=r?ft("#ffffff",.65,.05,`star:${e}|#ffd654`,()=>({map:r})):n;_e(t,new it(.145,16,14),n,0,.19,-.17,0,0,0,1.05,1.18,.76),_e(t,new Yt(.18,.15,.06),o,0,.15,-.255),_e(t,new kt(.042,.012,8,16,Math.PI),i,0,.355,-.155);for(const a of[-.115,.115])_e(t,new kt(.11,.022,8,16,Math.PI*.95),n,a,.24,-.05,0,Math.PI/2,0);return s.add(t),t}function Iv(s){const e=s==="girl",t=new Ge;t.name=`chibi-${s}`;const n=ft(e?"#ffe0c8":"#ffd9be",.62,.02),i=ft("#f8fafc",.72,.02),r=ft(e?"#2b3854":"#22324c",.76,.03),o=ft("#dc2f2f",.58,.04),a=ft("#ffffff",.72,.02),c=ft(e?"#323845":"#2b2f38",.58,.06),l=ft("#eceef2",.78,.02),h=ft(e?"#3b2318":"#3a2820",.62,.05),u=ft("#eb678e",.52,.06),f=new Ge;f.position.set(0,.44,0),t.add(f),_e(f,new it(.17,16,12),r,0,.02,0,0,0,0,1.05,.72,.88),e&&_e(f,new Nt(.16,.245,.19,18),r,0,-.01,0);const d=new Ge;d.position.set(0,.04,0),f.add(d),_e(d,new Nt(.145,.165,.3,16),i,0,.17,0,0,0,0,1.08,1,.85),_e(d,new kt(.11,.022,8,18),i,0,.31,.01,Math.PI/2,0,0),_e(d,new kt(.115,.024,8,18),o,0,.295,.015,Math.PI/2+.15,0,0),_e(d,new it(.032,10,8),o,0,.255,.125);const x=_e(d,new on(.036,.16,8),o,-.034,.17,.135,.1,0,.18,.8,1,.45),y=_e(d,new on(.032,.14,8),o,.036,.18,.132,.1,0,-.18,.8,1,.45);Lv(d,e?"#df5f86":"#2260b8");const g=new Ge;g.position.set(0,.34,.01),d.add(g),_e(g,new Nt(.06,.075,.09,12),n,0,.02,0);const m=yu(s),_=m?ft("#ffffff",.62,.02,`face:${s}`,()=>({map:m})):n,p=_e(g,new it(.245,28,22),_,0,.26,.01,0,-Math.PI/2,0,1,.96,1.04);p.name="chibi-head-face";for(const k of[-1,1])_e(g,new it(.052,12,10),n,k*.245,.23,-.01,0,0,0,.7,1.05,.85);const v=_e(g,new it(.258,24,18,0,Math.PI*2,0,Math.PI*.56),h,0,.275,-.01,-.24,0,0,1.04,.98,1.06);v.castShadow=!0,_e(g,new it(.254,20,14,Math.PI*.55,Math.PI*.9,.25,Math.PI*.62),h,0,.255,-.02,0,Math.PI*.5,0,1.04,.98,1.04);const T=e?[[-.12,.42,.19,.3,.2,.18],[-.04,.435,.21,.35,0,.08],[.05,.435,.21,.35,0,-.08],[.13,.415,.19,.3,-.2,-.18]]:[[-.13,.43,.18,.4,.25,.28],[-.04,.445,.2,.45,.05,.1],[.06,.445,.2,.45,-.05,-.12],[.14,.425,.18,.35,-.25,-.28],[0,.535,.05,-.2,0,.2],[-.1,.52,-.02,-.4,0,.55],[.11,.515,-.03,-.4,0,-.55],[0,.5,-.13,-.7,0,-.1]];for(const[k,z,V,Y,G,ne]of T)_e(g,new on(.07,.16,8),h,k,z,V,Y,G,ne,.95,1,.7);let S=null,w=null;if(e){const k=z=>{const V=new Ge;return V.position.set(z*.24,.34,-.1),_e(V,new it(.035,10,8),u,0,.02,0),_e(V,new Yt(.085,.038,.032),u,z*.02,.03,.02,0,0,z*.2),_e(V,new on(.085,.26,12),h,z*.055,-.11,-.04,.2,0,z*.35,.85,1,.9),_e(V,new it(.072,12,10),h,z*.04,-.06,-.03),g.add(V),V};S=k(-1),w=k(1)}const L=k=>{const z=new Ge;z.position.set(k*.2,.28,0),_e(z,new Nt(.055,.062,.11,12),i,0,-.035,0,0,0,k*.12),_e(z,new Qn(.042,.1,6,10),n,0,-.11,0);const V=new Ge;return V.position.set(0,-.16,0),z.add(V),_e(V,new Qn(.038,.1,6,10),n,0,-.06,0),_e(V,new it(.046,12,10),n,0,-.135,.01),z.forearm=V,d.add(z),z},b=L(-1),M=L(1),C=k=>{const z=new Ge;z.position.set(k*.095,-.02,0),e?_e(z,new Qn(.052,.12,6,10),n,0,-.08,0):_e(z,new Nt(.072,.078,.16,14),r,0,-.07,0);const V=new Ge;return V.position.set(0,-.16,0),z.add(V),_e(V,new Qn(.046,.08,6,10),n,0,-.04,0),_e(V,new Nt(.048,.046,.1,12),a,0,-.12,0),_e(V,new it(.062,12,10),c,0,-.2,.025,0,0,0,.92,.72,1.38),_e(V,new Yt(.11,.032,.168),l,0,-.244,.025),z.shin=V,f.add(z),z},D=C(-1),F=C(1);return{id:s,kind:"human",root:t,bodyPivot:f,torsoPivot:d,headPivot:g,leftArm:b,rightArm:M,leftLeg:D,rightLeg:F,scarfTailL:x,scarfTailR:y,hairPigtailL:S,hairPigtailR:w,headTopY:1.46,baseBodyY:.44}}function Dv(s){const e=new Ge;e.name=`chibi-${s}`;const t={dog:{fur:"#f1b96b",belly:"#fce5bd",ear:"#b97334",collar:"#d93636",nose:"#282220",paw:"#fbe6c4"},cat:{fur:"#f7a53e",belly:"#fde8c8",ear:"#f5942c",collar:"#2f9c76",nose:"#f07c86",paw:"#fef0d8"},cow:{fur:"#e6af5d",belly:"#fde9ca",ear:"#9c5e2c",collar:"#cc3a3a",nose:"#eb9a9a",paw:"#47352c"},buffalo:{fur:"#48505b",belly:"#606a78",ear:"#3a404a",collar:"#d48d2a",nose:"#2a2e36",paw:"#23262c"}}[s],n=ft(t.fur,.78,.02),i=ft(t.belly,.8,.02),r=ft(t.ear,.78,.02),o=ft("#f6a6b2",.72,.02),a=ft(t.collar,.48,.08),c=ft("#ffd34e",.25,.72),l=ft(s==="buffalo"?"#262a31":"#f4e6c8",.45,.12),h=ft(t.nose,.35,.08),u=ft(t.paw,s==="cow"||s==="buffalo"?.55:.78,.05),f=new Ge;f.position.set(0,.38,0),e.add(f);const d=new Ge;if(f.add(d),_e(d,new it(.195,20,16),n,0,.04,.02,0,0,0,.98,.94,1.36),_e(d,new it(.15,16,12),i,0,-.02,.06,0,0,0,.85,.72,1.15),s==="cow"){const M=Hi("#8b5329",.78,.02);_e(d,new it(.11,12,10),M,.13,.09,-.06,0,0,0,.6,.9,1.1),_e(d,new it(.09,12,10),M,-.14,.11,.08,0,0,0,.5,.85,.9)}if(s==="cat"){const M=Hi("#c56d1c",.78,.02);for(const C of[-.08,0,.08])_e(d,new kt(.14,.018,6,14,Math.PI*.9),M,0,.09,C,0,0,0)}_e(d,new kt(.135,.026,8,20),a,0,.13,.2,.55,0,0);const x=_e(d,new it(s==="cow"?.045:.036,12,10),c,0,.05,.3),y=new Ge;y.position.set(0,.21,.23),d.add(y);const g=yu(s),m=g?ft("#ffffff",.74,.02,`face:${s}`,()=>({map:g})):n;_e(y,new it(.225,24,20),m,0,.18,.02,0,-Math.PI/2,0,1.04,.94,1.02),_e(y,new it(.095,14,12),s==="buffalo"?n:i,0,.125,.2,0,0,0,1.18,.78,.85),_e(y,new it(s==="cow"||s==="buffalo"?.038:.03,12,10),h,0,.155,.265,0,0,0,1.3,.85,.85);const _=new Ge,p=new Ge;if(y.add(_,p),s==="dog")_.position.set(-.2,.24,.01),p.position.set(.2,.24,.01),_e(_,new it(.088,12,10),r,-.02,-.07,.01,.1,0,.35,.52,1.45,.78),_e(p,new it(.088,12,10),r,.02,-.07,.01,.1,0,-.35,.52,1.45,.78);else if(s==="cat")_.position.set(-.14,.35,.01),p.position.set(.14,.35,.01),_e(_,new on(.075,.15,4),r,0,.05,0,.12,Math.PI/4,.32),_e(_,new on(.045,.1,4),o,0,.04,.016,.12,Math.PI/4,.32),_e(p,new on(.075,.15,4),r,0,.05,0,.12,Math.PI/4,-.32),_e(p,new on(.045,.1,4),o,0,.04,.016,.12,Math.PI/4,-.32);else if(s==="cow"){_.position.set(-.21,.24,-.01),p.position.set(.21,.24,-.01),_e(_,new it(.075,12,10),r,-.06,-.02,0,0,0,1.15,.55,1.35,.75),_e(p,new it(.075,12,10),r,.06,-.02,0,0,0,-1.15,.55,1.35,.75);for(const M of[-1,1])_e(y,new on(.036,.105,10),l,M*.13,.365,.02,.15,0,-M*.35)}else if(s==="buffalo"){_.position.set(-.21,.21,-.02),p.position.set(.21,.21,-.02),_e(_,new it(.072,12,10),r,-.06,-.03,0,0,0,1.25,.5,1.35,.75),_e(p,new it(.072,12,10),r,.06,-.03,0,0,0,-1.25,.5,1.35,.75);for(const M of[-1,1]){const C=new Ze(new kt(.15,.034,10,18,Math.PI*.72),l);C.position.set(M*.17,.32,-.04),C.rotation.set(-.35,M*.35,M>0?-Math.PI*.18:Math.PI*.46),C.castShadow=!0,y.add(C)}}const v=new Ge;v.position.set(0,.1,-.22),d.add(v),s==="cat"?_e(v,new kt(.12,.032,8,16,Math.PI*1.15),n,0,.1,-.08,0,Math.PI/2,.3):s==="dog"?_e(v,new Qn(.036,.14,6,10),n,0,.08,-.06,-.6,0,0):(_e(v,new Nt(.018,.014,.22,8),n,0,-.07,-.05,.35,0,0),_e(v,new it(.038,10,8),r,0,-.17,-.09));const T=(M,C,D=.24)=>{const F=new Ge;return F.position.set(M,-.06,C),_e(F,new Qn(.052,D,6,10),n,0,-D*.45,0),_e(F,new it(.056,12,10),u,0,-D*.92-.02,.02,0,0,0,.95,.72,1.25),f.add(F),F},S=T(-.12,.15,.25),w=T(.12,.15,.25),L=T(-.12,-.15,.25),b=T(.12,-.15,.25);return{id:s,kind:"animal",root:e,bodyPivot:f,spinePivot:d,headPivot:y,earL:_,earR:p,bell:x,tailPivot:v,frontLeftLeg:S,frontRightLeg:w,backLeftLeg:L,backRightLeg:b,headTopY:s==="buffalo"?1.18:1.12,baseBodyY:.38}}function Nv(s="boy",{includeBike:e=!0}={}){const t=Ds(s),n=Rv(t),i=new Ge;i.name="chibi-actor";const r=n.kind==="human"?Iv(t):Dv(t),o=e?Pv(n.bikeColor):null;return o&&(o.group.visible=!1,i.add(o.group)),i.add(r.root),{avatarId:t,meta:n,actor:i,character:r,bike:o,wheels:o?.wheels||[],crank:o?.crank||null,headTopY:r.headTopY}}function Cr(s,{stance:e="idle",speed:t=0,phase:n=0,idleTime:i=0,pedalPhase:r=0,steer:o=0}={}){if(!s||!s.character)return;const a=s.character,c=s.bike,l=!!c&&e==="bike",h=e==="run",u=e==="walk",f=Math.abs(t);if(c&&(c.group.visible=l,l&&c.steerPivot&&(c.steerPivot.rotation.y=o*.42,c.pedalL.rotation.x=-r,c.pedalR.rotation.x=-r)),a.kind==="human"){if(l){a.bodyPivot.position.set(0,.62,-.17),a.bodyPivot.rotation.set(0,0,0),a.torsoPivot.rotation.set(.24,0,0),a.headPivot.rotation.set(-.2,o*.16,0);const d=.085,x=r,y=r+Math.PI;a.leftLeg.position.set(-.125,-.02+Math.sin(x)*d,.07+Math.cos(x)*.05),a.rightLeg.position.set(.125,-.02+Math.sin(y)*d,.07+Math.cos(y)*.05),a.leftLeg.rotation.set(-.72+Math.cos(x)*.26,0,0),a.rightLeg.rotation.set(-.72+Math.cos(y)*.26,0,0),a.leftLeg.shin.rotation.set(.76-Math.cos(x)*.24,0,0),a.rightLeg.shin.rotation.set(.76-Math.cos(y)*.24,0,0),a.leftArm.rotation.set(-1.12,0,-.08),a.rightArm.rotation.set(-1.12,0,.08),a.leftArm.forearm.rotation.set(-.28,0,0),a.rightArm.forearm.rotation.set(-.28,0,0);const g=Math.sin(i*8+f)*.06;a.scarfTailL.rotation.x=.22+g,a.scarfTailR.rotation.x=.22-g,a.hairPigtailL&&(a.hairPigtailL.rotation.x=.15+g*1.4,a.hairPigtailR.rotation.x=.15-g*1.4);return}if(a.leftLeg.position.set(-.095,-.02,0),a.rightLeg.position.set(.095,-.02,0),u||h){const x=n*(h?1.35:1),y=Math.sin(x),g=Math.cos(x),m=h?Math.abs(y)*.075:Math.abs(y)*.028,_=h?.78:.44,p=h?.88:.46;a.bodyPivot.position.set(0,a.baseBodyY+m,0),a.bodyPivot.rotation.set(0,0,0),a.torsoPivot.rotation.set(h?.24:.06,y*.06,0),a.headPivot.rotation.set(h?-.18:-.03,o*.18-y*.04,0),a.leftLeg.rotation.set(y*_,0,0),a.rightLeg.rotation.set(-y*_,0,0),a.leftLeg.shin.rotation.set(h?Math.max(.08,-g*.95+.35):Math.max(0,-g*.36+.1),0,0),a.rightLeg.shin.rotation.set(h?Math.max(.08,g*.95+.35):Math.max(0,g*.36+.1),0,0),a.leftArm.rotation.set(-y*p,0,.06),a.rightArm.rotation.set(y*p,0,-.06);const v=h?-.92:-.24;a.leftArm.forearm.rotation.set(v,0,0),a.rightArm.forearm.rotation.set(v,0,0);const T=Math.sin(x*1.4)*(h?.14:.05);a.scarfTailL.rotation.x=.14+T,a.scarfTailR.rotation.x=.14-T,a.hairPigtailL&&(a.hairPigtailL.rotation.x=(h?.28:.08)+T,a.hairPigtailR.rotation.x=(h?.28:.08)-T)}else{const d=Math.sin(i*2.4),x=Math.sin(i*3.8);a.bodyPivot.position.set(0,a.baseBodyY+d*.008,0),a.bodyPivot.rotation.set(0,0,0),a.torsoPivot.rotation.set(0,0,0),a.headPivot.rotation.set(d*.03,Math.sin(i*.9)*.06,0),a.leftLeg.rotation.set(0,0,.03),a.rightLeg.rotation.set(0,0,-.03),a.leftLeg.shin.rotation.set(0,0,0),a.rightLeg.shin.rotation.set(0,0,0),a.leftArm.rotation.set(.04,0,.08),a.leftArm.forearm.rotation.set(-.08,0,0);const y=Math.max(0,Math.sin(i*.65));a.rightArm.rotation.set(-.12-y*1.15,0,-.14-y*.45),a.rightArm.forearm.rotation.set(-.2-y*.35,0,y*x*.28),a.scarfTailL.rotation.x=.1+d*.03,a.scarfTailR.rotation.x=.1-d*.03,a.hairPigtailL&&(a.hairPigtailL.rotation.x=d*.04,a.hairPigtailR.rotation.x=d*.04)}return}if(l){a.bodyPivot.position.set(0,.62,-.16),a.bodyPivot.rotation.set(0,0,0),a.spinePivot.rotation.set(-.92,0,0),a.headPivot.rotation.set(.88,o*.18,0),a.tailPivot.rotation.set(.4,Math.sin(i*5+f)*.28,0),a.frontLeftLeg.position.set(-.15,.22,.09),a.frontRightLeg.position.set(.15,.22,.09),a.frontLeftLeg.rotation.set(-1.12,0,-.14),a.frontRightLeg.rotation.set(-1.12,0,.14);const d=r,x=r+Math.PI;a.backLeftLeg.position.set(-.13,-.05+Math.sin(d)*.075,.08+Math.cos(d)*.04),a.backRightLeg.position.set(.13,-.05+Math.sin(x)*.075,.08+Math.cos(x)*.04),a.backLeftLeg.rotation.set(-.45+Math.cos(d)*.3,0,0),a.backRightLeg.rotation.set(-.45+Math.cos(x)*.3,0,0);const y=Math.sin(i*6+f*1.2)*.08;a.earL.rotation.z=y,a.earR.rotation.z=-y;return}if(a.spinePivot.rotation.set(0,0,0),a.frontLeftLeg.position.set(-.12,-.06,.15),a.frontRightLeg.position.set(.12,-.06,.15),a.backLeftLeg.position.set(-.12,-.06,-.15),a.backRightLeg.position.set(.12,-.06,-.15),h){const d=n*1.45,x=Math.sin(d)*.72,y=Math.sin(d+Math.PI*.85)*.72,g=Math.abs(Math.sin(d))*.09;a.bodyPivot.position.set(0,a.baseBodyY+g,0),a.spinePivot.rotation.set(Math.cos(d)*.12,0,0),a.headPivot.rotation.set(-Math.cos(d)*.08,o*.2,0),a.frontLeftLeg.rotation.set(x,0,0),a.frontRightLeg.rotation.set(x+.16,0,0),a.backLeftLeg.rotation.set(y,0,0),a.backRightLeg.rotation.set(y+.16,0,0),a.tailPivot.rotation.set(-.15,Math.sin(d*1.5)*.35,0),a.earL.rotation.z=Math.sin(d)*.18,a.earR.rotation.z=-Math.sin(d)*.18,a.bell.rotation.x=Math.sin(d)*.25}else if(u){const d=n*1.15,x=Math.sin(d),y=Math.abs(x)*.03;a.bodyPivot.position.set(0,a.baseBodyY+y,0),a.headPivot.rotation.set(Math.sin(d*2)*.04,o*.18,0),a.frontLeftLeg.rotation.set(x*.46,0,0),a.backRightLeg.rotation.set(x*.46,0,0),a.frontRightLeg.rotation.set(-x*.46,0,0),a.backLeftLeg.rotation.set(-x*.46,0,0),a.tailPivot.rotation.set(0,Math.sin(d*1.5)*.38,0),a.earL.rotation.z=Math.sin(d)*.07,a.earR.rotation.z=-Math.sin(d)*.07,a.bell.rotation.x=Math.sin(d)*.1}else{const d=Math.sin(i*2.5);a.bodyPivot.position.set(0,a.baseBodyY+d*.008,0),a.headPivot.rotation.set(d*.04,Math.sin(i*1.1)*.08,0),a.frontLeftLeg.rotation.set(0,0,0),a.frontRightLeg.rotation.set(0,0,0),a.backLeftLeg.rotation.set(0,0,0),a.backRightLeg.rotation.set(0,0,0),a.tailPivot.rotation.set(0,Math.sin(i*5.2)*.42,0);const x=Math.max(0,Math.sin(i*2.2)-.85)*1.2;a.earL.rotation.z=x,a.earR.rotation.z=-x,a.bell.rotation.x=0}}const ih=s=>Math.atan2(Math.sin(s),Math.cos(s)),bs=(s,e,t,n)=>s+(e-s)*(1-Math.exp(-t*n));class Uv{constructor(e="bike"){this.mode=e==="foot"?"foot":"bike",this.reset()}reset(e=0,t=this.mode){this.mode=t==="foot"?"foot":"bike",this.speed=0,this.steering=0,this.heading=e,this.lean=0,this.distance=0,this.runCharge=0,this.stance=this.mode==="bike"?"bike":"idle"}setMode(e){const t=e==="foot"?"foot":"bike";return t===this.mode?this.mode:(this.mode=t,this.runCharge=0,t==="foot"?(this.speed=Math.max(-1.8,Math.min(5.6,this.speed)),this.lean=0,this.stance=Math.abs(this.speed)>=2.75?"run":Math.abs(this.speed)>=.14?"walk":"idle"):this.stance="bike",this.mode)}step(e,t,n,i=!1,r=!1,o=1){const a=Number.isFinite(o)&&o>0?o:1;if(this.mode==="foot")return this.stepFoot(e,t,n,i,r,a);const c=n*.55/(1+Math.abs(this.speed)*.07);n*this.steering<0&&(this.steering=0),this.steering=bs(this.steering,c,n?24:18,e);const l=9*a;let h=t*4.5*Math.max(1,a*.9)-this.speed*.32;t*this.speed<0&&(h=t*7-this.speed*.32),i&&(h=-Math.sign(this.speed)*Math.min(Math.abs(this.speed)/e,8)),this.speed>l&&!i?this.speed=Math.max(l,this.speed-9*e):this.speed=Math.max(-2.3,Math.min(l,this.speed+h*e)),Math.abs(this.speed)<.025&&!t&&(this.speed=0);const f=(this.speed>=0?Math.max(this.speed,t>.05?2.2:0):this.speed)*Math.tan(this.steering)/1.18;this.heading=ih(this.heading+f*e),this.lean=bs(this.lean,Math.max(-.33,Math.min(.33,-Math.atan(this.speed*f/9.81)*.55)),7,e),this.stance="bike";const d=this.speed*e;return this.distance+=Math.abs(d),{dx:Math.sin(this.heading)*d,dz:Math.cos(this.heading)*d}}stepFoot(e,t,n,i=!1,r=!1,o=1){const a=Number.isFinite(o)&&o>0?o:1,c=Math.abs(t);if(t>.35&&!i){const m=r||a>1?2.4:.72;this.runCharge=Math.min(1,this.runCharge+e*m)}else this.runCharge=Math.max(0,this.runCharge-e*1.9);const h=(2.4+(r?1:Math.max(0,Math.min(1,(this.runCharge-.38)/.52)))*3.2)*a;let u=0;!i&&c>.04&&(u=t>=0?Math.min(h,t*h):Math.max(-1.8,t*1.8));const f=i?16:c>.04?6.5*Math.max(1,a*.85):10.5;this.speed=bs(this.speed,u,f,e),Math.abs(this.speed)<.03&&c<=.04&&(this.speed=0),this.steering=bs(this.steering,n*.55,n?18:16,e);const d=2.55-Math.min(.85,Math.abs(this.speed)*.14),x=this.speed<-.25?-1:1;this.heading=ih(this.heading+n*d*x*e),this.lean=bs(this.lean,Math.max(-.14,Math.min(.14,-n*Math.abs(this.speed)*.02)),10,e);const y=Math.abs(this.speed);this.stance=y>=2.75?"run":y>=.14?"walk":"idle";const g=this.speed*e;return this.distance+=Math.abs(g),{dx:Math.sin(this.heading)*g,dz:Math.cos(this.heading)*g}}}class iy extends Ge{constructor({avatar:e=sh,mode:t="foot"}={}){super(),this.motion=new Uv(t),this.avatarId=Ds(e),this.transportMode=this.motion.mode,this.pedalPhase=0,this.walkPhase=0,this.idleTime=0,this.rider=new Ge,this.rider.name="chibi-rider-anchor",this.add(this.rider),this.rig=null,this.wheels=[],this.crank=new Ge,this.legs=[],this.headTopY=1.46,this.playerColor=null,this.setAvatar(this.avatarId)}get stance(){return this.motion.stance}setAvatar(e){const t=Ds(e);return this.rig&&this.avatarId===t?this.avatarId:(this.rig&&(this.rig.actor.removeFromParent(),Av(this.rig.actor,new Ge)),this.avatarId=t,this.rig=Nv(t),this.playerColor&&this.rig.bike.setColor(this.playerColor),this.add(this.rig.actor),this.wheels=this.rig.wheels,this.crank=this.rig.crank,this.headTopY=this.rig.headTopY,this.identityTag&&(this.identityTag.position.y=this.headTopY+.34),Cr(this.rig,{stance:this.motion.stance,speed:this.motion.speed,phase:this.walkPhase,idleTime:this.idleTime,pedalPhase:this.pedalPhase,steer:this.motion.steering}),this.avatarId)}setBikeColor(e){this.playerColor=e,this.rig?.bike?.setColor(e)}setTransportMode(e){const t=e==="bike"?"bike":"foot";return this.transportMode=this.motion.setMode(t),Cr(this.rig,{stance:this.motion.stance,speed:this.motion.speed,phase:this.walkPhase,idleTime:this.idleTime,pedalPhase:this.pedalPhase,steer:this.motion.steering}),this.transportMode}toggleTransportMode(){return this.setTransportMode(this.transportMode==="bike"?"foot":"bike")}async loadDetailedModel(){return Promise.resolve()}reset(e,t,n){this.position.set(e,0,t),this.rotation.set(0,n,0),this.motion.reset(n,this.transportMode),this.pedalPhase=0,this.walkPhase=0,this.idleTime=0,Cr(this.rig,{stance:this.motion.stance,speed:0,phase:0,idleTime:0,pedalPhase:0,steer:0})}update(e,t,n,i=!1,r={}){const o=!!r?.sprint,a=Number.isFinite(r?.speedMultiplier)?r.speedMultiplier:1,c=this.motion.step(e,t,n,i,o,a);this.position.x+=c.dx,this.position.z+=c.dz,this.rotation.y=this.motion.heading,this.rotation.z=this.motion.lean;const l=r?.stance?Du(r.stance,this.motion.speed):this.motion.stance;this.motion.stance=l,this.idleTime+=e;const h=Math.abs(this.motion.speed);if(this.pedalPhase+=this.motion.speed*e*3.1,(l==="walk"||l==="run")&&(this.walkPhase+=Math.max(1.2,h)*e*2.55),l==="bike"){for(const u of this.wheels)u.rotation.x+=this.motion.speed*e/.243;this.crank.rotation.x=this.pedalPhase}Cr(this.rig,{stance:l,speed:this.motion.speed,phase:this.walkPhase,idleTime:this.idleTime,pedalPhase:this.pedalPhase,steer:this.motion.steering})}}function Fv(s){return{core:new fn({color:s.color,emissive:s.glow,emissiveIntensity:s.id==="100"?1.15:.78,roughness:.22,metalness:.35}),ring:new Tt({color:s.accent,transparent:!0,opacity:.9}),halo:new Tt({color:s.color,transparent:!0,opacity:.34,side:Et,depthWrite:!1})}}class sy{constructor(e){this.scene=e,this.root=new Ge,this.root.name="speed-charm-pickups",this.scene?.add(this.root),this.items=new Map,this.bursts=[],this.coreGeo=new qr(.46,0),this.ringGeo=new kt(.66,.045,8,24),this.haloGeo=new Mn(.55,.95,24),this.haloGeo.rotateX(-Math.PI/2),this.burstGeo=new Mn(.45,.75,24),this.burstGeo.rotateX(-Math.PI/2),this.materials=new Map(Hr.map(t=>[t.id,Fv(t)]))}attachScene(e){this.scene=e,this.root.removeFromParent(),e?.add(this.root)}sync(e=[]){const t=new Set;for(const n of e){if(!n?.id||(t.add(n.id),this.items.has(n.id)))continue;const i=this.materials.get(n.tier)||this.materials.get("10"),r=new Ge,o=n.tier==="100"?1.32:n.tier==="30"?1.16:1,a=new Ze(this.coreGeo,i.core);a.position.y=1.05,a.scale.setScalar(o);const c=new Ze(this.ringGeo,i.ring);c.position.y=1.05,c.rotation.x=Math.PI*.35,c.scale.setScalar(o);const l=new Ze(this.haloGeo,i.halo);l.position.y=.06,l.scale.setScalar(o),r.add(a,c,l),r.position.set(n.x,n.y||.25,n.z),this.root.add(r),this.items.set(n.id,{group:r,core:a,ring:c,halo:l,baseScale:o,phase:this.items.size*1.37%(Math.PI*2)})}for(const[n,i]of this.items)t.has(n)||(i.group.removeFromParent(),this.items.delete(n))}spawnPickupBurst(e,t,n,i){const r=Is[i]||Is[10],o=new Tt({color:r.accent,transparent:!0,opacity:.9,side:Et,depthWrite:!1}),a=new Ze(this.burstGeo,o);a.position.set(e,(t||.25)+.14,n),this.root.add(a),this.bursts.push({mesh:a,mat:o,age:0,duration:.45})}update(e,t,n){for(const i of this.items.values()){const r=n?i.group.position.x-n.x:0,o=n?i.group.position.z-n.z:0,a=r*r+o*o;if(i.group.visible=a<260*260,!i.group.visible)continue;const c=Math.sin(t*2.9+i.phase)*.16;i.core.position.y=1.05+c,i.core.rotation.y=t*2.1+i.phase,i.ring.position.y=1.05+c,i.ring.rotation.z=t*2.4+i.phase,i.ring.rotation.y=t*1.1;const l=1+Math.sin(t*3.6+i.phase)*.12;i.halo.scale.setScalar(i.baseScale*l)}for(let i=this.bursts.length-1;i>=0;i--){const r=this.bursts[i];r.age+=e;const o=Math.min(1,r.age/r.duration);r.mesh.scale.setScalar(1+o*2.6),r.mat.opacity=.9*(1-o),o>=1&&(r.mesh.removeFromParent(),r.mat.dispose(),this.bursts.splice(i,1))}}dispose(){for(const e of this.items.values())e.group.removeFromParent();this.items.clear();for(const e of this.bursts)e.mesh.removeFromParent(),e.mat.dispose();this.bursts=[],this.root.removeFromParent(),this.coreGeo.dispose(),this.ringGeo.dispose(),this.haloGeo.dispose(),this.burstGeo.dispose();for(const e of this.materials.values())e.core.dispose(),e.ring.dispose(),e.halo.dispose()}}class ry{constructor(){this.group=new Ge,this.group.name="speed-boost-aura",this.group.visible=!1,this.ringMat=new Tt({color:"#2ee59d",transparent:!0,opacity:.72,side:Et,depthWrite:!1});const e=new Mn(.58,.92,28);e.rotateX(-Math.PI/2),this.ring=new Ze(e,this.ringMat),this.ring.position.y=.08,this.group.add(this.ring),this.streakMat=new Tt({color:"#a8ffd8",transparent:!0,opacity:.75,depthWrite:!1});const t=new Yt(.035,.035,1.05);this.streaks=[];for(let n=0;n<8;n++){const i=new Ze(t,this.streakMat),r=n/8*Math.PI*2,o=.48+n%2*.24;i.userData={x:Math.cos(r)*o,y:.35+n%4*.24,phase:n*.37},this.group.add(i),this.streaks.push(i)}this.geometries=[e,t]}attachTo(e){this.group.parent!==e&&(this.group.removeFromParent(),e?.add(this.group))}update(e,{active:t=!1,tierId:n="10",speed:i=0}={}){if(this.group.visible=t,!t)return;const r=Is[n]||Is[10];this.ringMat.color.set(r.color),this.streakMat.color.set(r.accent);const o=1+Math.sin(e*11)*.14,a=r.id==="100"?1.32:r.id==="30"?1.15:1;this.ring.scale.setScalar(o*a),this.ringMat.opacity=.45+.25*(.5+.5*Math.sin(e*9));const c=Math.max(.5,Math.min(2.2,Math.abs(i)/8));this.streakMat.opacity=Math.min(.85,.28+c*.32);for(const l of this.streaks){const h=(e*(2.6+c*1.8)+l.userData.phase)%1;l.position.set(l.userData.x,l.userData.y,-.35-h*2.2),l.scale.z=.7+c*.7}}dispose(){this.group.removeFromParent();for(const e of this.geometries)e.dispose();this.ringMat.dispose(),this.streakMat.dispose()}}export{Ev as $,rh as A,_t as B,Nt as C,Ls as D,Zh as E,qe as F,Ge as G,Qa as H,Ef as I,Rn as J,Df as K,Qh as L,Ze as M,tu as N,gt as O,Yr as P,Qn as Q,Yi as R,it as S,kt as T,Vh as U,I as V,Tt as W,kh as X,Hv as Y,Ve as Z,Ut as _,V_ as a,Wn as a0,eu as a1,Mn as a2,fl as a3,Nv as a4,Cr as a5,Lh as a6,Xv as a7,Ip as a8,ny as a9,Hf as aa,Gf as ab,Wv as ac,Av as ad,Kv as ae,zv as af,sy as ag,Vv as ah,Is as ai,Ov as aj,Hr as ak,Xt as al,iy as am,qv as an,Yv as ao,ry as ap,$v as aq,pd as ar,Wu as as,ih as at,bs as au,Yl as av,ey as aw,Gv as ax,Du as ay,Ds as b,Nu as c,sh as d,Cu as e,Bv as f,Qv as g,Zv as h,Jv as i,jv as j,Xe as k,We as l,fn as m,Et as n,ty as o,Yt as p,on as q,du as r,kv as s,sc as t,wt as u,Yh as v,te as w,qr as x,Kd as y,Nh as z};
