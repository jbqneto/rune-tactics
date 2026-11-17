var su=Object.defineProperty;var ru=(s,t,e)=>t in s?su(s,t,{enumerable:!0,configurable:!0,writable:!0,value:e}):s[t]=e;var B=(s,t,e)=>ru(s,typeof t!="symbol"?t+"":t,e);(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function e(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(i){if(i.ep)return;i.ep=!0;const r=e(i);fetch(i.href,r)}})();const En=12,ou=1,Es=12,An=4,au=.35,lu=.25,cu=1,hu="rune_tactics_v4_save",Hh=4,te=(s,t,e)=>e.map(([n,i])=>({pos:{x:n,y:i},kind:s,blocksLos:t})),ul=[...te("wall",!0,[[0,6],[1,6],[4,6],[5,6],[6,6],[7,6],[9,6],[10,6],[11,6]]),...te("pillar",!0,[[3,3],[8,3],[3,9],[8,9]]),...te("crate",!1,[[5,4],[6,4],[6,9],[10,8]]),...te("barrel",!1,[[10,2],[1,8]])],Gh=[{id:"ruins",name:"Ruínas Atuais",gridSize:En,obstacles:ul,playerSpawnRows:[0,1],enemySpawnRows:[10,11]},{id:"fortress",name:"Fortaleza Abandonada",gridSize:En,obstacles:[...te("wall",!0,[[2,5],[3,5],[4,5],[7,5],[8,5],[9,5],[2,7],[3,7],[8,7],[9,7]]),...te("pillar",!0,[[5,3],[6,3],[5,8],[6,8]]),...te("crate",!1,[[0,5],[11,5],[4,8],[7,8]]),...te("barrel",!1,[[1,3],[10,3]])],playerSpawnRows:[0,1],enemySpawnRows:[10,11]},{id:"courtyard",name:"Pátio das Ruínas",gridSize:En,obstacles:[...te("pillar",!0,[[3,4],[8,4],[3,7],[8,7]]),...te("wall",!0,[[5,5],[6,5]]),...te("crate",!1,[[1,5],[10,6],[4,8],[7,3]]),...te("barrel",!1,[[2,3],[9,8]])],playerSpawnRows:[0,1],enemySpawnRows:[10,11]},{id:"catacombs",name:"Catacumbas Cruzadas",gridSize:En,obstacles:[...te("wall",!0,[[2,4],[2,5],[2,6],[2,7],[9,4],[9,5],[9,6],[9,7],[4,3],[7,3],[4,8],[7,8]]),...te("pillar",!0,[[5,5],[6,6]]),...te("crate",!1,[[0,6],[11,5],[5,2],[6,9]]),...te("barrel",!1,[[1,3],[10,8],[3,5],[8,6]])],playerSpawnRows:[0,1],enemySpawnRows:[10,11]},{id:"sanctuary",name:"Santuário Rúnico",gridSize:En,obstacles:[...te("wall",!0,[[4,5],[4,6],[7,5],[7,6],[0,4],[1,4],[10,7],[11,7]]),...te("pillar",!0,[[2,2],[9,2],[2,9],[9,9],[5,4],[6,7]]),...te("crate",!1,[[3,6],[8,5],[5,8],[6,3]]),...te("barrel",!1,[[1,8],[10,3]])],playerSpawnRows:[0,1],enemySpawnRows:[10,11]},{id:"gauntlet",name:"Corredor da Forja",gridSize:En,obstacles:[...te("wall",!0,[[0,4],[1,4],[2,4],[3,4],[8,7],[9,7],[10,7],[11,7],[5,5],[6,6]]),...te("pillar",!0,[[5,2],[6,9],[2,7],[9,4]]),...te("crate",!1,[[4,3],[7,4],[4,7],[7,8]]),...te("barrel",!1,[[1,6],[10,5],[3,8],[8,3]])],playerSpawnRows:[0,1],enemySpawnRows:[10,11]},{id:"forgotten-swamp",name:"Pântano Esquecido",gridSize:En,theme:"swamp",obstacles:[...te("water",!1,[[0,5],[1,5],[3,5],[4,5],[7,5],[8,5],[10,5],[11,5],[0,6],[1,6],[3,6],[4,6],[7,6],[8,6],[10,6],[11,6]]),...te("pillar",!0,[[2,2],[9,2],[2,9],[9,9]]),...te("crate",!1,[[4,3],[7,3],[4,8],[7,8]]),...te("barrel",!1,[[1,3],[10,3],[1,8],[10,8]])],bridgeCells:[{x:2,y:5},{x:5,y:5},{x:6,y:5},{x:9,y:5},{x:2,y:6},{x:5,y:6},{x:6,y:6},{x:9,y:6}],playerSpawnRows:[0,1],enemySpawnRows:[10,11]},{id:"corrupted-sanctuary",name:"Santuário Corrompido",gridSize:En,theme:"sanctuary",obstacles:[...te("wall",!0,[[3,3],[8,3],[0,5],[11,5],[0,6],[11,6],[3,8],[8,8]]),...te("pillar",!0,[[1,2],[10,2],[5,7],[6,7],[1,9],[10,9]]),...te("crate",!1,[[4,2],[7,2],[4,6],[7,6]]),...te("barrel",!1,[[2,4],[9,4]])],playerSpawnRows:[0,1],enemySpawnRows:[10,11]}],ur={"runic-strike":{id:"runic-strike",name:"Runic Strike",targetTeam:"enemy",damage:4,heal:0,attackKind:"melee",range:1,cooldown:2,area:"single",icon:"/assets/icons/runic-strike.png"},"marked-shot":{id:"marked-shot",name:"Marked Shot",targetTeam:"enemy",damage:3,heal:0,attackKind:"ranged",range:3,cooldown:2,area:"single",icon:"/assets/icons/marked-shot.svg"},"arcane-burst":{id:"arcane-burst",name:"Arcane Burst",targetTeam:"enemy",damage:2,heal:0,attackKind:"magic",range:3,cooldown:3,area:"cross",icon:"/assets/icons/arcane-burst.svg"},"healing-light":{id:"healing-light",name:"Healing Light",targetTeam:"ally",damage:0,heal:3,range:3,cooldown:2,area:"single",icon:"/assets/icons/healing-light.svg"},"dark-mend":{id:"dark-mend",name:"Dark Mend",targetTeam:"ally",damage:0,heal:2,range:3,cooldown:2,area:"single"}},ks={knight:{name:"Guerreiro",baseHp:8,baseArmor:1,basePower:2,attributes:{str:6,dex:4,int:3,fort:6},attackKind:"melee",moveRange:3,attackRange:1,skillId:"runic-strike",portraitPath:"/assets/portraits/knight.png"},archer:{name:"Arqueira",baseHp:8,baseArmor:0,basePower:2,attributes:{str:4,dex:6,int:3,fort:4},attackKind:"ranged",moveRange:3,attackRange:3,skillId:"marked-shot",portraitPath:"/assets/portraits/archer.png"},mage:{name:"Mago",baseHp:7,baseArmor:0,basePower:2,attributes:{str:3,dex:4,int:6,fort:4},attackKind:"magic",moveRange:2,attackRange:2,skillId:"arcane-burst",portraitPath:"/assets/portraits/mage.png"},cleric:{name:"Clérigo",baseHp:7,baseArmor:1,basePower:2,attributes:{str:5,dex:3,int:6,fort:5},attackKind:"melee",moveRange:2,attackRange:1,skillId:"healing-light",portraitPath:"/assets/portraits/cleric.png"},"melee-skeleton":{name:"Melee Skeleton",baseHp:5,baseArmor:0,basePower:2,attributes:{str:5,dex:4,int:2,fort:4},attackKind:"melee",moveRange:2,attackRange:1,skillId:null,portraitPath:"/assets/portraits/melee-skeleton.png"},"skeleton-archer":{name:"Skeleton Archer",baseHp:4,baseArmor:0,basePower:2,attributes:{str:4,dex:6,int:2,fort:4},attackKind:"ranged",moveRange:2,attackRange:3,skillId:null,portraitPath:"/assets/portraits/skeleton-archer.png"},"armored-skeleton":{name:"Armored Skeleton",baseHp:7,baseArmor:2,basePower:2,attributes:{str:7,dex:4,int:2,fort:6},attackKind:"melee",moveRange:2,attackRange:1,skillId:null,portraitPath:"/assets/portraits/armored-skeleton.png"},"goblin-scout":{name:"Goblin Scout",baseHp:4,baseArmor:0,basePower:2,attributes:{str:4,dex:6,int:3,fort:4},attackKind:"melee",moveRange:4,attackRange:1,skillId:null,portraitPath:"/assets/portraits/goblin-scout.png"},"cultist-mage":{name:"Cultist Mage",baseHp:6,baseArmor:0,basePower:2,attributes:{str:3,dex:4,int:7,fort:4},attackKind:"magic",moveRange:2,attackRange:3,skillId:null,portraitPath:"/assets/portraits/cultist-mage.png"},"goblin-stalker":{name:"Goblin Stalker",baseHp:6,baseArmor:0,basePower:2,attributes:{str:7,dex:7,int:3,fort:4},attackKind:"melee",moveRange:4,attackRange:1,skillId:null,portraitPath:"/assets/portraits/goblin-stalker.png"},"skeleton-shieldbearer":{name:"Skeleton Shieldbearer",baseHp:7,baseArmor:1,basePower:2,attributes:{str:5,dex:4,int:2,fort:6},attackKind:"melee",moveRange:2,attackRange:1,skillId:null,portraitPath:"/assets/portraits/skeleton-shieldbearer.png"},"necromancer-acolyte":{name:"Necromancer Acolyte",baseHp:5,baseArmor:0,basePower:2,attributes:{str:3,dex:4,int:7,fort:5},attackKind:"magic",moveRange:2,attackRange:3,skillId:"dark-mend",portraitPath:"/assets/portraits/necromancer-acolyte.png"},"ashen-guardian":{name:"Guardião das Cinzas",baseHp:20,baseArmor:1,basePower:4,attributes:{str:7,dex:4,int:7,fort:8},attackKind:"melee",moveRange:2,attackRange:1,skillId:null,portraitPath:"/assets/portraits/ashen-guardian.png"}},du={1:{skillName:"Golpe das Cinzas",basePower:4,attackKind:"magic",range:3,cooldown:2,area:"cross"},2:{skillName:"Erupção das Cinzas",basePower:5,attackKind:"magic",range:3,cooldown:2,area:"3x3"}},zh=[{id:"knight-1",type:"knight",team:"player",pos:{x:4,y:1}},{id:"archer-1",type:"archer",team:"player",pos:{x:2,y:0}},{id:"mage-1",type:"mage",team:"player",pos:{x:7,y:0}},{id:"cleric-1",type:"cleric",team:"player",pos:{x:6,y:1}},{id:"goblin-scout-1",type:"goblin-scout",team:"enemy",pos:{x:10,y:9}},{id:"melee-skeleton-1",type:"melee-skeleton",team:"enemy",pos:{x:3,y:10}},{id:"melee-skeleton-2",type:"melee-skeleton",team:"enemy",pos:{x:8,y:10}},{id:"armored-skeleton-1",type:"armored-skeleton",team:"enemy",pos:{x:5,y:10}},{id:"skeleton-archer-1",type:"skeleton-archer",team:"enemy",pos:{x:2,y:11}},{id:"cultist-mage-1",type:"cultist-mage",team:"enemy",pos:{x:6,y:11}}],Kn=[{id:"knight-1",type:"knight",pos:{x:4,y:1}},{id:"cleric-1",type:"cleric",pos:{x:7,y:1}},{id:"archer-1",type:"archer",pos:{x:2,y:0}},{id:"mage-1",type:"mage",pos:{x:9,y:0}}],Si=[{stageNumber:1,id:"stage-1-outpost",name:"Posto Avançado",subtitle:"Ruínas da Muralha Central",mapId:"ruins",isBossStage:!1,heroSpawns:Kn,enemies:[{id:"goblin-scout-1",type:"goblin-scout",pos:{x:2,y:10}},{id:"melee-skeleton-1",type:"melee-skeleton",pos:{x:5,y:10}},{id:"goblin-scout-2",type:"goblin-scout",pos:{x:9,y:10}}]},{stageNumber:2,id:"stage-2-swamp",name:"Pântano Esquecido",subtitle:"As Três Pontes da Névoa",mapId:"forgotten-swamp",isBossStage:!1,heroSpawns:Kn,enemies:[{id:"goblin-stalker-1",type:"goblin-stalker",pos:{x:2,y:10}},{id:"goblin-scout-1",type:"goblin-scout",pos:{x:5,y:10}},{id:"goblin-scout-2",type:"goblin-scout",pos:{x:6,y:10}},{id:"goblin-stalker-2",type:"goblin-stalker",pos:{x:9,y:10}},{id:"skeleton-archer-1",type:"skeleton-archer",pos:{x:5,y:11}}]},{stageNumber:3,id:"stage-3-fortress",name:"Fortaleza dos Ossos",subtitle:"Muralha de Escudos",mapId:"fortress",isBossStage:!1,heroSpawns:Kn,enemies:[{id:"skeleton-shieldbearer-1",type:"skeleton-shieldbearer",pos:{x:4,y:10}},{id:"skeleton-shieldbearer-2",type:"skeleton-shieldbearer",pos:{x:7,y:10}},{id:"melee-skeleton-1",type:"melee-skeleton",pos:{x:2,y:10}},{id:"melee-skeleton-2",type:"melee-skeleton",pos:{x:9,y:10}},{id:"armored-skeleton-1",type:"armored-skeleton",pos:{x:5,y:10}},{id:"skeleton-archer-1",type:"skeleton-archer",pos:{x:6,y:11}}]},{stageNumber:4,id:"stage-4-catacombs",name:"Catacumbas Arcanas",subtitle:"Conclave das Sombras",mapId:"catacombs",isBossStage:!1,heroSpawns:Kn,enemies:[{id:"armored-skeleton-1",type:"armored-skeleton",pos:{x:4,y:10}},{id:"armored-skeleton-2",type:"armored-skeleton",pos:{x:7,y:10}},{id:"cultist-mage-1",type:"cultist-mage",pos:{x:1,y:11}},{id:"cultist-mage-2",type:"cultist-mage",pos:{x:10,y:11}},{id:"necromancer-acolyte-1",type:"necromancer-acolyte",pos:{x:4,y:11}},{id:"necromancer-acolyte-2",type:"necromancer-acolyte",pos:{x:7,y:11}}]},{stageNumber:5,id:"stage-5-sanctuary",name:"Santuário Corrompido",subtitle:"Altar do Guardião das Cinzas",mapId:"corrupted-sanctuary",isBossStage:!0,heroSpawns:Kn,enemies:[{id:"skeleton-shieldbearer-1",type:"skeleton-shieldbearer",pos:{x:4,y:10}},{id:"ashen-guardian-1",type:"ashen-guardian",pos:{x:6,y:10}},{id:"necromancer-acolyte-1",type:"necromancer-acolyte",pos:{x:8,y:11}}]}];function fl(s){return Math.floor(Math.max(0,s-An)/3)}function vo(s,t){return s+2*Math.max(0,t-An)}function pl(s){return Math.floor(Math.max(0,s-An)/4)}function Vh(s,t){switch(t){case"melee":return s.str;case"ranged":return s.dex;case"magic":return s.int}}function uu(s,t,e){return s+fl(Vh(t,e))}function fu(s,t){return s+pl(t)}function pu(s,t){if(s.unspentPoints<=0)return{ok:!1,reason:"Sem pontos de atributo disponíveis."};const e=s.attributes[t];if(e>=Es)return{ok:!1,reason:`Atributo ${t.toUpperCase()} já atingiu o limite máximo (${Es}).`};const n=e+1,i={...s.attributes,[t]:n};let r=s.maxHp,o=s.hp;if(t==="fort"){const a=s.maxHp;r=vo(s.baseHp,n);const l=Math.max(0,r-a);o=Math.min(r,s.hp+l)}return{ok:!0,hero:{...s,attributes:i,maxHp:r,hp:o,unspentPoints:s.unspentPoints-1}}}const mu=["str","dex","int","fort"];function ma(s){return{...s,attributes:{...s.attributes}}}function ps(s){return s.map(ma)}function On(s){return{...s,heroes:ps(s.heroes),checkpoint:{stageNumber:s.checkpoint.stageNumber,heroes:ps(s.checkpoint.heroes)}}}function gu(){return Kn.map(s=>{const t=ks[s.type],e={...t.attributes},n=vo(t.baseHp,e.fort);return{id:s.id,type:s.type,attributes:e,hp:n,maxHp:n,unspentPoints:0}})}function _u(s){return mu.every(t=>s.attributes[t]>=Es)}class vu{constructor(t){B(this,"state",null);this.saveSystem=t}startNewCampaign(){const t=gu();return this.state={version:Hh,status:"in_stage",currentStage:1,heroes:t,checkpoint:{stageNumber:1,heroes:ps(t)}},this.persist(),On(this.state)}loadCampaign(){if(!this.saveSystem)return null;const t=this.saveSystem.load();return t?(this.state=On(t),On(this.state)):null}getState(){return this.state?On(this.state):null}getCurrentStageConfig(){const t=this.requireState(),e=Si.find(n=>n.stageNumber===t.currentStage);if(!e)throw new Error(`Fase inválida na campanha: ${t.currentStage}`);return e}createStageGameSetup(t){const e=this.requireState(),n=this.getCurrentStageConfig(),i=[...n.heroSpawns.map(r=>({id:r.id,type:r.type,team:"player",pos:{...r.pos}})),...n.enemies.map(r=>({id:r.id,type:r.type,team:"enemy",pos:{...r.pos}}))];return{mode:"campaign",stageNumber:n.stageNumber,stageName:n.name,mapId:n.mapId,randomizeSpawns:!1,units:i,heroOverrides:ps(e.heroes),...t!==void 0?{seed:t}:{}}}completeStage(t){const e=this.requireState();if(e.status!=="in_stage")throw new Error('Só é possível concluir uma fase quando status === "in_stage".');if(t.winner!=="player")throw new Error("A fase só pode ser concluída após vitória do jogador.");if(t.stageNumber!==void 0&&t.stageNumber!==e.currentStage)throw new Error(`Snapshot da fase ${t.stageNumber} não corresponde à fase atual ${e.currentStage}.`);const n=e.currentStage>=Si.length;return e.heroes=e.heroes.map(i=>{const r=t.units.find(a=>a.id===i.id);if(!r)throw new Error(`Herói ${i.id} ausente no snapshot da batalha.`);if(n)return{...ma(i),hp:r.alive?Math.min(i.maxHp,Math.max(1,r.hp)):0};const o=ma(i);if(r.alive&&r.hp>0){const a=Math.ceil(o.maxHp*au);o.hp=Math.min(o.maxHp,r.hp+a)}else o.hp=Math.max(1,Math.ceil(o.maxHp*lu));return o.unspentPoints+=cu,o}),e.status=n?"completed":"between_stages",this.persist(),On(e)}allocateHeroAttribute(t,e){if(!this.state)return{ok:!1,reason:"Nenhuma campanha ativa."};if(this.state.status!=="between_stages")return{ok:!1,reason:"Atributos só podem ser alocados entre fases."};const n=this.state.heroes.findIndex(a=>a.id===t);if(n===-1)return{ok:!1,reason:`Herói não encontrado: ${t}`};const i=this.state.heroes[n],r=ks[i.type].baseHp,o=pu({baseHp:r,hp:i.hp,maxHp:i.maxHp,attributes:{...i.attributes},unspentPoints:i.unspentPoints},e);return o.ok?(this.state.heroes[n]={...i,attributes:{...o.hero.attributes},maxHp:o.hero.maxHp,hp:o.hero.hp,unspentPoints:o.hero.unspentPoints},this.persist(),{ok:!0,state:On(this.state)}):{ok:!1,reason:o.reason}}canAdvanceToNextStage(){return!this.state||this.state.status!=="between_stages"||this.state.currentStage>=Si.length?!1:this.state.heroes.every(t=>t.unspentPoints===0||_u(t))}advanceToNextStage(){return this.state?this.state.status!=="between_stages"?{ok:!1,reason:"A campanha não está entre fases."}:this.state.currentStage>=Si.length?{ok:!1,reason:"A campanha já está na última fase."}:this.canAdvanceToNextStage()?(this.state.currentStage+=1,this.state.status="in_stage",this.state.checkpoint={stageNumber:this.state.currentStage,heroes:ps(this.state.heroes)},this.persist(),{ok:!0,state:On(this.state)}):{ok:!1,reason:"Distribua todos os pontos de atributo pendentes antes de avançar."}:{ok:!1,reason:"Nenhuma campanha ativa."}}restartCurrentStage(){const t=this.requireState();return t.currentStage=t.checkpoint.stageNumber,t.heroes=ps(t.checkpoint.heroes),t.status="in_stage",this.persist(),On(t)}clearCampaign(){var t;this.state=null,(t=this.saveSystem)==null||t.clear()}requireState(){if(!this.state)throw new Error("Nenhuma campanha ativa.");return this.state}persist(){this.state&&this.saveSystem&&this.saveSystem.save(On(this.state))}}const xu=new Set(["in_stage","between_stages","completed"]),yu=["str","dex","int","fort"];function io(s){return typeof s=="object"&&s!==null&&!Array.isArray(s)}function ga(s,t,e){return typeof s=="number"&&Number.isInteger(s)&&s>=t&&s<=e}function Mu(s,t){if(!io(s)||typeof s.id!="string"||typeof s.type!="string")return null;const e=Kn.find(l=>l.id===s.id&&l.type===s.type);if(!e||!io(s.attributes))return null;const n={};for(const l of yu){const c=s.attributes[l];if(!ga(c,ou,Es))return null;n[l]=c}const i=n,r=ks[e.type].baseHp,o=vo(r,i.fort);if(s.maxHp!==o)return null;const a=t?0:1;return!ga(s.hp,a,o)||typeof s.unspentPoints!="number"||!Number.isInteger(s.unspentPoints)||s.unspentPoints<0?null:{id:e.id,type:e.type,attributes:i,hp:s.hp,maxHp:o,unspentPoints:s.unspentPoints}}function jl(s,t){if(!Array.isArray(s)||s.length!==Kn.length)return null;const e=[],n=new Set;for(const i of s){const r=Mu(i,t);if(!r||n.has(r.id))return null;n.add(r.id),e.push(r)}for(const i of Kn)if(!n.has(i.id))return null;return e}function Su(s){if(!io(s)||s.version!==Hh||typeof s.status!="string"||!xu.has(s.status))return null;const t=s.status;if(!ga(s.currentStage,1,Si.length))return null;const e=jl(s.heroes,t==="completed");if(!e||!io(s.checkpoint)||s.checkpoint.stageNumber!==s.currentStage)return null;const n=jl(s.checkpoint.heroes,!1);return n?{version:4,status:t,currentStage:s.currentStage,heroes:e,checkpoint:{stageNumber:s.checkpoint.stageNumber,heroes:n}}:null}class wu{constructor(t,e=hu){this.storage=t,this.key=e}save(t){this.storage.setItem(this.key,JSON.stringify(t))}load(){const t=this.storage.getItem(this.key);if(!t)return null;let e;try{e=JSON.parse(t)}catch{return null}return Su(e)}hasValidSave(){return this.load()!==null}clear(){this.storage.removeItem(this.key)}}const bu=[{x:0,y:1},{x:1,y:0},{x:0,y:-1},{x:-1,y:0}];function ue(s,t){return Math.abs(s.x-t.x)+Math.abs(s.y-t.y)}function _n(s,t){return s.x===t.x&&s.y===t.y}function Eu(s,t,e){let i=0,r=1;for(const o of["x","y"]){const a=t[o]-s[o],l=e[o]-.499999-s[o],c=e[o]+.499999-s[o];if(a===0){if(l>0||c<0)return!1;continue}i=Math.max(i,Math.min(l/a,c/a)),r=Math.min(r,Math.max(l/a,c/a))}return i<=r}class Au{constructor(t=En,e=ul){this.size=t,this.obstacles=e}isInBounds(t){return Number.isInteger(t.x)&&Number.isInteger(t.y)&&t.x>=0&&t.y>=0&&t.x<this.size&&t.y<this.size}isObstacle(t){return this.obstacles.some(e=>_n(e.pos,t))}isOccupied(t,e){return e.some(n=>n.alive&&_n(n.pos,t))}isBlocked(t,e){return!this.isInBounds(t)||this.isObstacle(t)||this.isOccupied(t,e)}getNeighbors(t){return bu.map(e=>({x:t.x+e.x,y:t.y+e.y})).filter(e=>this.isInBounds(e))}hasLineOfSight(t,e,n=this.obstacles){return!n.some(i=>i.blocksLos&&!_n(i.pos,t)&&!_n(i.pos,e)&&Eu(t,e,i.pos))}getReachableCells(t,e,n){return this.search(t,n,e).slice(1).map(i=>({...i.cell}))}getPath(t,e,n){let i=this.search(t,n,1/0).find(o=>_n(o.cell,e))??null;if(!i)return null;const r=[];for(;i;i=i.prev)r.unshift({...i.cell});return r}search(t,e,n){if(!this.isInBounds(t))return[];const i=[{cell:t,dist:0,prev:null}],r=new Set([t.y*this.size+t.x]);for(let o=0;o<i.length;o++){const a=i[o];if(!(a.dist>=n))for(const l of this.getNeighbors(a.cell)){const c=l.y*this.size+l.x;r.has(c)||this.isBlocked(l,e)||(r.add(c),i.push({cell:l,dist:a.dist+1,prev:a}))}}return i}}function hn(s,t,e,n){return ue(s,t)<=e&&(e<=1||n.hasLineOfSight(s,t))}function yr(s,t,e){return s.alive&&!s.hasAttacked&&t.alive&&t.team!==s.team&&hn(s.pos,t.pos,s.attackRange,e)}function xo(s,t,e,n){const i=Vh(s.attributes,n),r=e+fl(i),o=t.baseArmor+pl(t.attributes.fort),a=Math.max(1,r-o);return t.isGuarding?Math.max(1,Math.ceil(a*.5)):a}function ml(s,t,e,n,i){const r=t.isGuarding,o=xo(s,t,e,n);t.hp=Math.max(0,t.hp-o);const a=[{type:"unitAttacked",attackerId:s.id,targetId:t.id,damage:o,targetHpRemaining:t.hp,...r?{wasGuarded:!0}:{},...i}];return t.hp===0?(t.alive=!1,t.isGuarding=!1,a.push({type:"unitDied",unitId:t.id})):t.type==="ashen-guardian"&&t.bossPhase===1&&t.hp<=Math.floor(t.maxHp*.5)&&(t.bossPhase=2,t.moveRange+=1,a.push({type:"bossPhaseChanged",unitId:t.id,phase:2,newMoveRange:t.moveRange})),a}function Zl(s){return s.hasAttacked=!0,s.isGuarding=!0,[{type:"unitGuarded",unitId:s.id}]}function To(s,t){return s.hasAttacked=!0,ml(s,t,s.basePower,s.attackKind,{isRanged:s.attackRange>1})}function xi(s){return s.skillId?ur[s.skillId]:null}function Wh(s,t,e){if(!e.isInBounds(t))return[];const n={x:t.x,y:t.y};return s.area==="cross"?[n,...e.getNeighbors(n)]:[n]}function Xh(s,t,e,n,i){const r=Wh(t,e,i);return t.targetTeam==="ally"?n.filter(o=>o.alive&&o.team===s.team&&o.hp<o.maxHp&&r.some(a=>_n(a,o.pos))):n.filter(o=>o.alive&&o.team!==s.team&&r.some(a=>_n(a,o.pos)))}function tr(s,t,e,n,i){return!i.isInBounds(e)||i.isObstacle(e)||t.targetTeam==="enemy"&&_n(e,s.pos)?!1:hn(s.pos,e,t.range,i)&&Xh(s,t,e,n,i).length>0}function Tu(s,t,e){const n=xi(s);if(!n||!s.alive||s.hasAttacked||s.skillCooldown>0)return[];const i=[];for(let r=0;r<e.size;r++)for(let o=0;o<e.size;o++)tr(s,n,{x:o,y:r},t,e)&&i.push({x:o,y:r});return i}function Co(s,t,e,n,i){const r=Xh(s,t,e,n,i);s.hasAttacked=!0,s.skillCooldown=t.cooldown;const o={type:"skillUsed",casterId:s.id,skillId:t.id,targetCell:{x:e.x,y:e.y},affectedUnitIds:r.map(l=>l.id)};if(t.targetTeam==="ally"){const l=t.heal+fl(s.attributes.int),c=r.map(h=>{const d=Math.min(l,h.maxHp-h.hp);return h.hp+=d,{type:"unitHealed",casterId:s.id,targetId:h.id,amount:d,targetHpAfter:h.hp}});return[o,...c]}const a=t.attackKind??s.attackKind;return[o,...r.flatMap(l=>ml(s,l,t.damage,a,{isRanged:t.range>1,skillId:t.id}))]}function Cu(s,t,e){const n=e.filter(l=>l.alive&&l.team!==t.team&&s.targetCells.some(c=>_n(c,l.pos))),i={type:"pendingAttackResolved",pendingAttackId:s.id,casterId:t.id,skillName:s.skillName,targetCells:s.targetCells.map(l=>({x:l.x,y:l.y})),affectedUnitIds:n.map(l=>l.id)},r=n.flatMap(l=>ml(t,l,s.basePower,s.attackKind,{pendingAttackId:s.id})),o=r.filter(l=>l.type==="unitAttacked"),a=r.filter(l=>l.type!=="unitAttacked");return[i,...o,...a]}const Yh=2;function Le(s,t){let e,n=1/0;for(const i of s){const r=t(i);r<n&&([e,n]=[i,r])}return e}function yi(s,t){let e;for(const n of s)(e===void 0||t(n,e)<0)&&(e=n);return e}function Ru(s,t,e){if(!e.isInBounds(s))return[];if(t===1)return[{x:s.x,y:s.y},...e.getNeighbors(s)];const n=[];for(let i=-1;i<=1;i++)for(let r=-1;r<=1;r++){const o={x:s.x+r,y:s.y+i};e.isInBounds(o)&&n.push(o)}return n}function qh(s,t,e,n){const i=c=>t.filter(h=>hn(c,h.pos,s.attackRange,n)),r=c=>Math.min(...t.map(h=>ue(c,h.pos))),o=i(s.pos);if(o.length>0)return{type:"attack",target:Le(o,h=>h.hp*100+ue(s.pos,h.pos))};if(s.hasMoved)return null;const a=n.getReachableCells(s.pos,1/0,e).filter(c=>i(c).length>0).map(c=>({cell:c,steps:n.getPath(s.pos,c,e).length-1}));let l;if(a.length>0){const c=a.filter(h=>h.steps<=s.moveRange);l=Le(c.length>0?c:a,h=>r(h.cell)>=Yh?h.steps:h.steps+100).cell}else{const c=n.getReachableCells(s.pos,s.moveRange,e),h=Le(c,r);h&&r(h)<r(s.pos)&&(l=h)}return l?{type:"move",path:n.getPath(s.pos,l,e).slice(0,s.moveRange+1)}:null}function Iu(s,t,e,n){const i=h=>h.baseArmor+pl(h.attributes.fort),r=(h,d)=>h.hp-d.hp||i(h)-i(d)||ue(s.pos,h.pos)-ue(s.pos,d.pos),o=h=>t.filter(d=>hn(h,d.pos,s.attackRange,n)),a=o(s.pos);if(a.length>0){const h=a.filter(u=>xo(s,u,s.basePower,s.attackKind)>=u.hp);return{type:"attack",target:h.length>0?yi(h,(u,f)=>f.damage-u.damage||r(u,f)):yi(a,r)}}if(s.hasMoved)return null;const l=n.getReachableCells(s.pos,1/0,e).filter(h=>o(h).length>0).map(h=>{const d=o(h),u=yi(d,r),f=t.filter(g=>ue(g.pos,h)===1).length;return{cell:h,steps:n.getPath(s.pos,h,e).length-1,bestTarget:u,adjacentHeroes:f}});let c;if(l.length>0){const h=l.filter(u=>u.steps<=s.moveRange),d=h.length>0?h:l;c=yi(d,(u,f)=>r(u.bestTarget,f.bestTarget)||u.steps-f.steps||u.adjacentHeroes-f.adjacentHeroes).cell}else{const h=yi(t,r),d=n.getReachableCells(s.pos,s.moveRange,e),u=g=>ue(g,h.pos),f=Le(d,u);f&&u(f)<u(s.pos)&&(c=f)}return c?{type:"move",path:n.getPath(s.pos,c,e).slice(0,s.moveRange+1)}:null}function Pu(s,t,e,n){const i=a=>t.filter(l=>hn(a,l.pos,s.attackRange,n)),r=a=>Math.min(...t.map(l=>ue(a,l.pos))),o=i(s.pos);if(o.length>0){const a=o.filter(c=>xo(s,c,s.basePower,s.attackKind)>=c.hp);return a.length>0?{type:"attack",target:Le(a,h=>h.hp*100+ue(s.pos,h.pos))}:!s.isGuarding&&(s.hp<=Math.floor(s.maxHp*.5)||o.length>=2)?{type:"defend"}:{type:"attack",target:Le(o,c=>ue(s.pos,c.pos)*100+c.hp)}}if(!s.hasMoved){const a=e.filter(d=>d.alive&&d.team===s.team&&d.id!==s.id&&d.attackRange>1),l=d=>a.length===0?0:Math.min(...a.map(u=>ue(d,u.pos))),c=n.getReachableCells(s.pos,1/0,e).filter(d=>i(d).length>0).map(d=>({cell:d,steps:n.getPath(s.pos,d,e).length-1}));let h;if(c.length>0){const d=c[0].steps,u=c.filter(f=>f.steps===d);h=yi(u,(f,g)=>i(g.cell).length-i(f.cell).length||l(f.cell)-l(g.cell)).cell}else{const d=n.getReachableCells(s.pos,s.moveRange,e),u=Le(d,r);u&&r(u)<r(s.pos)&&(h=u)}if(h)return{type:"move",path:n.getPath(s.pos,h,e).slice(0,s.moveRange+1)}}return!s.isGuarding&&t.some(a=>ue(s.pos,a.pos)<=4)?{type:"defend"}:null}function Lu(s,t,e,n){const i=xi(s);if(i&&s.skillCooldown===0){const r=e.filter(a=>a.alive&&a.team===s.team&&a.hp<a.maxHp&&(a.type==="ashen-guardian"||a.hp<=Math.floor(a.maxHp*.75))),o=yi(r,(a,l)=>{const c=a.type==="ashen-guardian"?0:1,h=l.type==="ashen-guardian"?0:1;return c-h||a.hp/a.maxHp-l.hp/l.maxHp||ue(s.pos,a.pos)-ue(s.pos,l.pos)});if(o){if(hn(s.pos,o.pos,i.range,n))return{type:"skill",skillId:i.id,targetCell:{...o.pos}};if(!s.hasMoved){const a=c=>Math.min(...t.map(h=>ue(c,h.pos))),l=n.getReachableCells(s.pos,s.moveRange,e).filter(c=>hn(c,o.pos,i.range,n)).map(c=>({cell:c,steps:n.getPath(s.pos,c,e).length-1}));if(l.length>0){const c=Le(l,h=>a(h.cell)>=Yh?h.steps:h.steps+100).cell;return{type:"move",path:n.getPath(s.pos,c,e).slice(0,s.moveRange+1)}}}}}return qh(s,t,e,n)}function Du(s,t,e,n){const i=s.bossPhase??1,r=du[i];if(s.skillCooldown===0){const h=[];for(let d=0;d<n.size;d++)for(let u=0;u<n.size;u++){const f={x:u,y:d},g=ue(s.pos,f);if(g>r.range)continue;const _=Ru(f,i,n),m=t.filter(y=>_.some(M=>_n(M,y.pos)));if(m.length===0)continue;const p=m.reduce((y,M)=>y+M.hp,0);h.push({center:f,area:_,hitCount:m.length,hpSum:p,dist:g})}if(h.length>0){const d=yi(h,(u,f)=>f.hitCount-u.hitCount||u.hpSum-f.hpSum||u.dist-f.dist||u.center.y-f.center.y||u.center.x-f.center.x);return{type:"prepareAttack",skillName:r.skillName,targetCells:d.area,basePower:r.basePower,attackKind:r.attackKind,cooldown:r.cooldown}}}const o=h=>t.filter(d=>hn(h,d.pos,s.attackRange,n)),a=o(s.pos);if(a.length>0){const h=a.filter(u=>xo(s,u,s.basePower,s.attackKind)>=u.hp);return{type:"attack",target:h.length>0?Le(h,u=>u.hp):Le(a,u=>u.hp)}}if(s.hasMoved)return null;const l=n.getReachableCells(s.pos,1/0,e).filter(h=>o(h).length>0);let c;if(l.length>0)c=l[0];else{const h=f=>Math.min(...t.map(g=>ue(f,g.pos))),d=n.getReachableCells(s.pos,s.moveRange,e),u=Le(d,h);u&&h(u)<h(s.pos)&&(c=u)}return c?{type:"move",path:n.getPath(s.pos,c,e).slice(0,s.moveRange+1)}:null}function Nu(s,t,e){if(!s.alive||s.hasAttacked)return null;const n=t.filter(c=>c.alive&&c.team!==s.team);if(n.length===0)return null;switch(s.type){case"goblin-stalker":return Iu(s,n,t,e);case"skeleton-shieldbearer":return Pu(s,n,t,e);case"necromancer-acolyte":return Lu(s,n,t,e);case"ashen-guardian":return Du(s,n,t,e);case"skeleton-archer":case"cultist-mage":return qh(s,n,t,e)}const i=c=>n.filter(h=>hn(c,h.pos,s.attackRange,e)),r=c=>Math.min(...n.map(h=>ue(c,h.pos))),o=i(s.pos);if(o.length>0)return{type:"attack",target:s.type==="armored-skeleton"?Le(o,h=>ue(s.pos,h.pos)):Le(o,h=>h.hp*100+ue(s.pos,h.pos))};if(s.hasMoved)return null;const a=e.getReachableCells(s.pos,1/0,t).filter(c=>i(c).length>0).map(c=>({cell:c,steps:e.getPath(s.pos,c,t).length-1}));let l;if(a.length>0){const c=a[0].steps;if(s.type==="armored-skeleton"){const h=a.filter(d=>d.steps===c);l=Le(h,d=>-i(d.cell).length).cell}else s.type==="goblin-scout"?l=Le(a,h=>Math.min(...i(h.cell).map(u=>u.hp))*1e3+h.steps).cell:l=a[0].cell}else{const c=e.getReachableCells(s.pos,s.moveRange,t);if(s.type==="goblin-scout"){const h=Le(n,f=>f.hp*100+ue(s.pos,f.pos)),d=f=>ue(f,h.pos),u=Le(c,d);u&&d(u)<d(s.pos)&&(l=u)}else{const h=Le(c,r);h&&r(h)<r(s.pos)&&(l=h)}}return l?{type:"move",path:e.getPath(s.pos,l,t).slice(0,s.moveRange+1)}:null}function Uu(s,t){const e=ks[s.type],n=t?{...t.attributes}:{...e.attributes},i=vo(e.baseHp,n.fort),r=t?Math.min(i,Math.max(1,t.hp)):i,o=uu(e.basePower,n,e.attackKind),a=fu(e.baseArmor,n.fort);return{id:s.id,name:e.name,type:s.type,team:s.team,pos:{...s.pos},hp:r,maxHp:i,attributes:n,baseHp:e.baseHp,baseArmor:e.baseArmor,basePower:e.basePower,attackKind:e.attackKind,damage:o,armor:a,moveRange:e.moveRange,attackRange:e.attackRange,alive:!0,hasMoved:!1,hasAttacked:!1,hasActivatedThisRound:!1,skillId:e.skillId,skillName:e.skillId?ur[e.skillId].name:null,skillCooldown:0,isGuarding:!1,...s.type==="ashen-guardian"?{bossPhase:1}:{},portraitPath:e.portraitPath}}function ku(s=zh,t){return s.map(e=>{const n=t&&e.team==="player"?t.find(i=>i.id===e.id):void 0;return Uu(e,n)})}function Fu(s){let t=s>>>0;return()=>{t=t+1831565813|0;let e=Math.imul(t^t>>>15,1|t);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296}}function Jl(s,t){for(let e=s.length-1;e>0;e--){const n=Math.floor(t()*(e+1));[s[e],s[n]]=[s[n],s[e]]}return s}function Ou(s,t,e,n){if(n){const o=s.find(a=>a.id===n);if(o)return o}const i=s.length>=2&&e?s.filter(o=>o.id!==e):s,r=Math.floor(t()*i.length);return i[r]??s[0]}function Ql(s,t,e){const n=new Set(e.map(r=>`${r.pos.x},${r.pos.y}`)),i=[];for(const r of t)for(let o=0;o<s;o++)n.has(`${o},${r}`)||i.push({x:o,y:r});return i}function Bu(s,t,e,n,i,r){const o=Jl(Ql(t,n,e),r),a=Jl(Ql(t,i,e),r);let l=0,c=0;return s.map(h=>{if(h.team==="player"){const u=o[l++];if(!u)throw new Error("Espaço insuficiente nas linhas de spawn do jogador.");return{...h,pos:{...u}}}const d=a[c++];if(!d)throw new Error("Espaço insuficiente nas linhas de spawn dos inimigos.");return{...h,pos:{...d}}})}function Hu(s){const t=s.filter(r=>r.team==="player").map(r=>r.id),e=s.filter(r=>r.team==="enemy").map(r=>r.id),n=[],i=Math.max(t.length,e.length);for(let r=0;r<i;r++)r<t.length&&n.push(t[r]),r<e.length&&n.push(e[r]);return n}class Gu{constructor(){B(this,"turnState","player_unit_active");B(this,"turnOrder",[]);B(this,"turnIndex",0);B(this,"round",1);B(this,"activeUnitId",null);B(this,"winner",null)}get phase(){return this.turnState==="victory"||this.turnState==="defeat"?this.turnState:this.turnState==="enemy_activation"?"enemy":"player"}get activationLocked(){return this.turnState==="player_unit_active"}get activationTeam(){return this.isOver?null:this.turnState==="enemy_activation"?"enemy":"player"}get isOver(){return this.turnState==="victory"||this.turnState==="defeat"}reset(t){this.round=1,this.winner=null,this.turnOrder=Hu(t),this.turnIndex=0,this.activeUnitId=null;for(const i of t)i.hasMoved=!1,i.hasAttacked=!1,i.hasActivatedThisRound=!1,i.skillCooldown=0,i.isGuarding=!1;const e=this.turnOrder.findIndex(i=>{var r;return(r=t.find(o=>o.id===i))==null?void 0:r.alive});if(e===-1){this.turnState="defeat",this.winner="enemy";return}this.turnIndex=e;const n=t.find(i=>i.id===this.turnOrder[e]);this.activeUnitId=n.id,this.turnState=n.team==="player"?"player_unit_active":"enemy_activation"}advanceTurn(t,e){if(this.isOver||this.turnOrder.length===0)return[];t.hasActivatedThisRound=!0;const n=t.team,i=[{type:"activationEnded",unitId:t.id}];let r=!1,o=-1;for(let l=this.turnIndex+1;l<this.turnOrder.length;l++){const c=e.find(h=>h.id===this.turnOrder[l]);if(c!=null&&c.alive){o=l;break}}if(o===-1){r=!0,this.round+=1;for(const l of e)l.hasMoved=!1,l.hasAttacked=!1,l.hasActivatedThisRound=!1,l.alive&&l.skillCooldown>0&&(l.skillCooldown=Math.max(0,l.skillCooldown-1));i.push({type:"roundStarted",round:this.round});for(let l=0;l<this.turnOrder.length;l++){const c=e.find(h=>h.id===this.turnOrder[l]);if(c!=null&&c.alive){o=l;break}}}if(o===-1)return this.activeUnitId=null,i;this.turnIndex=o;const a=e.find(l=>l.id===this.turnOrder[o]);return a.isGuarding=!1,this.activeUnitId=a.id,this.turnState=a.team==="player"?"player_unit_active":"enemy_activation",(r||a.team!==n)&&i.push({type:"turnChanged",phase:this.phase,round:this.round}),i.push({type:"activationStarted",unitId:a.id,team:a.team,round:this.round}),i}checkBattleEnd(t){if(this.isOver)return[];const e=n=>t.some(i=>i.team===n&&i.alive);if(!e("player"))this.turnState="defeat",this.winner="enemy",this.activeUnitId=null;else if(!e("enemy"))this.turnState="victory",this.winner="player",this.activeUnitId=null;else return[];return[{type:"battleEnded",winner:this.winner}]}}const Bn={ok:!0},Se=s=>({ok:!1,reason:s}),tc=s=>({...s,pos:{...s.pos},attributes:{...s.attributes}}),ec=s=>({...s,targetCells:s.targetCells.map(t=>({...t}))});class $h{constructor(t={}){B(this,"setup");B(this,"grid");B(this,"turns",new Gu);B(this,"units",[]);B(this,"selectedUnitId",null);B(this,"events",[]);B(this,"pendingAttacks",[]);B(this,"pendingAttackCounter",0);B(this,"undoSnapshot",null);B(this,"currentMapId","ruins");B(this,"currentMapName","Ruínas Atuais");B(this,"currentSeed",0);B(this,"lastMapId",null);B(this,"matchCount",0);this.setup=t,this.start()}getState(){return{mode:this.setup.mode??"quick-battle",...this.setup.stageNumber!==void 0?{stageNumber:this.setup.stageNumber}:{},...this.setup.stageName!==void 0?{stageName:this.setup.stageName}:{},mapId:this.currentMapId,mapName:this.currentMapName,seed:this.currentSeed,gridSize:this.grid.size,obstacles:this.grid.obstacles.map(t=>({...t.pos})),obstacleDefs:this.grid.obstacles.map(t=>({...t,pos:{...t.pos}})),units:this.units.map(tc),phase:this.turns.phase,turnState:this.turns.turnState,turnOrder:[...this.turns.turnOrder],turnIndex:this.turns.turnIndex,round:this.turns.round,activeUnitId:this.turns.activeUnitId,activationLocked:this.turns.activationLocked,activationTeam:this.turns.activationTeam,selectedUnitId:this.selectedUnitId,canUndoMove:this.canUndoMoveNow(),pendingAttacks:this.pendingAttacks.map(ec),winner:this.turns.winner}}selectUnit(t){return this.turns.turnState!=="player_unit_active"||t!==this.turns.activeUnitId?Se("Não é possível alterar a unidade ativa."):Bn}getReachableCells(t){const e=this.findUnit(t??this.selectedUnitId);return!e||!this.canUnitActNow(e)||e.hasMoved?[]:this.grid.getReachableCells(e.pos,e.moveRange,this.units)}getPath(t,e){return this.grid.getPath(t,e,this.units)}getAttackableTargets(t){const e=this.findUnit(t??this.selectedUnitId);return!e||!this.canUnitActNow(e)?[]:this.units.filter(n=>yr(e,n,this.grid)).map(tc)}hasLineOfSight(t,e){return this.grid.hasLineOfSight(t,e)}getAttackRangeCells(t){const e=this.findUnit(t??this.selectedUnitId);if(!e||!this.canUnitActNow(e)||e.hasAttacked)return[];const n=[];for(let i=0;i<this.grid.size;i++)for(let r=0;r<this.grid.size;r++){const o={x:r,y:i},a=ue(e.pos,o);a>=1&&a<=e.attackRange&&!this.grid.isObstacle(o)&&hn(e.pos,o,e.attackRange,this.grid)&&n.push(o)}return n}getSkillRangeCells(t){const e=this.findUnit(t??this.selectedUnitId);if(!e||!this.canUnitActNow(e)||e.hasAttacked||e.skillCooldown>0)return[];const n=xi(e);if(!n)return[];const i=[];for(let r=0;r<this.grid.size;r++)for(let o=0;o<this.grid.size;o++){const a={x:o,y:r},l=ue(e.pos,a);n.targetTeam==="ally"?l<=n.range&&!this.grid.isObstacle(a)&&hn(e.pos,a,n.range,this.grid)&&i.push(a):l>=1&&l<=n.range&&!this.grid.isObstacle(a)&&hn(e.pos,a,n.range,this.grid)&&i.push(a)}return i}getSkillTargetCells(t){const e=this.findUnit(t??this.selectedUnitId);return!e||!this.canUnitActNow(e)?[]:Tu(e,this.units,this.grid)}getSkillAreaCells(t,e){const n=this.findUnit(e??this.selectedUnitId),i=n&&xi(n);return i?Wh(i,t,this.grid):[]}moveSelectedUnit(t){const e=this.activePlayerUnit();if(typeof e=="string")return Se(e);if(e.hasMoved)return Se("A unidade já se moveu nesta ativação.");if(!this.getReachableCells(e.id).some(r=>_n(r,t)))return Se("Célula fora do alcance.");const n={x:e.pos.x,y:e.pos.y},i=this.grid.getPath(e.pos,t,this.units);return e.pos={x:t.x,y:t.y},e.hasMoved=!0,(!this.undoSnapshot||this.undoSnapshot.unitId!==e.id)&&(this.undoSnapshot={unitId:e.id,prevPos:n,used:!1}),this.events.push({type:"unitMoved",unitId:e.id,path:i}),this.postActionCheck(e),Bn}undoMove(){if(!this.canUndoMoveNow())return Se("Não é possível desfazer o movimento agora.");const t=this.findUnit(this.turns.activeUnitId),e={x:t.pos.x,y:t.pos.y},n={x:this.undoSnapshot.prevPos.x,y:this.undoSnapshot.prevPos.y};return t.pos=n,t.hasMoved=!1,this.undoSnapshot.used=!0,this.events.push({type:"moveUndone",unitId:t.id,path:[e,n]}),Bn}attackTarget(t){const e=this.activePlayerUnit();if(typeof e=="string")return Se(e);if(e.hasAttacked)return Se("A unidade já atacou nesta ativação.");const n=this.findUnit(t);return n?n.alive?n.team===e.team?Se("O alvo não é inimigo."):ue(e.pos,n.pos)>e.attackRange?Se("Alvo fora do alcance."):yr(e,n,this.grid)?(this.undoSnapshot=null,this.pushCombatEvents(To(e,n)),this.postActionCheck(e),Bn):Se("Sem linha de visão até o alvo."):Se("O alvo está morto."):Se("Alvo não encontrado.")}useSkill(t){const e=this.activePlayerUnit();if(typeof e=="string")return Se(e);const n=xi(e);return n?e.hasAttacked?Se("A unidade já atacou nesta ativação."):e.skillCooldown>0?Se(`${n.name} em recarga: faltam ${e.skillCooldown} rodada(s).`):tr(e,n,t,this.units,this.grid)?(this.undoSnapshot=null,this.pushCombatEvents(Co(e,n,t,this.units,this.grid)),this.postActionCheck(e),Bn):Se(`Célula inválida para ${n.name}.`):Se("A unidade não tem habilidade.")}defend(){const t=this.activePlayerUnit();return typeof t=="string"?Se(t):t.hasAttacked?Se("A unidade já agiu nesta ativação."):(this.undoSnapshot=null,this.events.push(...Zl(t)),this.postActionCheck(t),Bn)}getSmartAttackPlan(t){if(this.turns.isOver||this.turns.turnState!=="player_unit_active")return null;const e=this.findUnit(this.turns.activeUnitId);if(!e||!e.alive||e.team!=="player"||e.hasAttacked)return null;const n=this.findUnit(t);if(!n||!n.alive||n.team===e.team)return null;if(yr(e,n,this.grid))return{path:[{...e.pos}]};if(e.hasMoved)return null;const i=[];for(const r of this.getReachableCells(e.id)){const o={...e,pos:r};if(!yr(o,n,this.grid))continue;const a=this.grid.getPath(e.pos,r,this.units);a&&i.push({path:a,steps:a.length-1,dist:ue(r,n.pos),cell:r})}return i.length===0?null:(i.sort((r,o)=>r.steps-o.steps||r.dist-o.dist||r.cell.y-o.cell.y||r.cell.x-o.cell.x),{path:i[0].path})}smartAttack(t){const e=this.getSmartAttackPlan(t);if(!e)return Se("Ataque inteligente indisponível para este alvo.");const n=this.findUnit(this.turns.activeUnitId),i=this.findUnit(t);if(this.undoSnapshot=null,e.path.length>1){const r=e.path[e.path.length-1];n.pos={x:r.x,y:r.y},n.hasMoved=!0,this.events.push({type:"unitMoved",unitId:n.id,path:e.path})}return this.pushCombatEvents(To(n,i)),this.postActionCheck(n),Bn}getSmartSkillPlan(t){if(this.turns.isOver||this.turns.turnState!=="player_unit_active")return null;const e=this.findUnit(this.turns.activeUnitId);if(!e||!e.alive||e.team!=="player"||e.hasAttacked||e.skillCooldown>0)return null;const n=xi(e);if(!n)return null;if(tr(e,n,t,this.units,this.grid))return{path:[{...e.pos}]};if(e.hasMoved)return null;const i=[];for(const r of this.getReachableCells(e.id)){const o={...e,pos:r};if(!tr(o,n,t,this.units,this.grid))continue;const a=this.grid.getPath(e.pos,r,this.units);a&&i.push({path:a,steps:a.length-1,dist:ue(r,t),cell:r})}return i.length===0?null:(i.sort((r,o)=>r.steps-o.steps||r.dist-o.dist||r.cell.y-o.cell.y||r.cell.x-o.cell.x),{path:i[0].path})}smartUseSkill(t){const e=this.getSmartSkillPlan(t);if(!e)return Se("Habilidade inteligente indisponível para esta célula.");const n=this.findUnit(this.turns.activeUnitId),i=xi(n);if(this.undoSnapshot=null,e.path.length>1){const r=e.path[e.path.length-1];n.pos={x:r.x,y:r.y},n.hasMoved=!0,this.events.push({type:"unitMoved",unitId:n.id,path:e.path})}return this.pushCombatEvents(Co(n,i,t,this.units,this.grid)),this.postActionCheck(n),Bn}endPlayerTurn(){const t=this.activePlayerUnit();return typeof t=="string"?Se(t):(this.undoSnapshot=null,this.advanceAndResolvePending(t),Bn)}executeNextEnemyAction(){if(this.turns.turnState!=="enemy_activation")return!1;const t=this.findUnit(this.turns.activeUnitId);if(!t||!t.alive)return!1;const e=Nu(t,this.units,this.grid);if(!e)return this.advanceAndResolvePending(t),!1;if(e.type==="attack")this.pushCombatEvents(To(t,e.target));else if(e.type==="defend")this.events.push(...Zl(t));else if(e.type==="skill"){const n=xi(t);if(!n||!tr(t,n,e.targetCell,this.units,this.grid))return this.advanceAndResolvePending(t),!1;this.pushCombatEvents(Co(t,n,e.targetCell,this.units,this.grid))}else if(e.type==="prepareAttack"){t.hasAttacked=!0,t.skillCooldown=e.cooldown,this.pendingAttackCounter+=1;const n={id:`${t.id}-pending-${this.turns.round}-${this.pendingAttackCounter}`,casterId:t.id,skillName:e.skillName,targetCells:e.targetCells.map(i=>({x:i.x,y:i.y})),basePower:e.basePower,attackKind:e.attackKind,preparedRound:this.turns.round};this.pendingAttacks.push(n),this.events.push({type:"attackPrepared",pendingAttack:ec(n)})}else t.pos={...e.path[e.path.length-1]},t.hasMoved=!0,this.events.push({type:"unitMoved",unitId:t.id,path:e.path});return this.postActionCheck(t),!0}reset(){this.start(),this.events.push({type:"gameReset"})}consumeEvents(){const t=this.events;return this.events=[],t}start(){this.matchCount+=1,this.setup.seed!==void 0?this.currentSeed=this.setup.seed+(this.matchCount-1)>>>0:this.currentSeed=Math.floor(Math.random()*4294967295)>>>0;const t=Fu(this.currentSeed),e=(this.setup.obstacles!==void 0||this.setup.gridSize!==void 0)&&this.setup.mapId===void 0;let n;e?n={id:"custom",name:"Custom",gridSize:this.setup.gridSize??En,obstacles:this.setup.obstacles??ul,playerSpawnRows:[0,1],enemySpawnRows:[10,11]}:n=Ou(Gh,t,this.lastMapId,this.setup.mapId),this.currentMapId=n.id,this.currentMapName=n.name,this.lastMapId=n.id,this.grid=new Au(n.gridSize,n.obstacles);const i=this.setup.units??zh,o=(this.setup.randomizeSpawns!==void 0?this.setup.randomizeSpawns:this.setup.units===void 0)?Bu(i,n.gridSize,n.obstacles,n.playerSpawnRows,n.enemySpawnRows,t):i;this.units=ku(o,this.setup.heroOverrides),this.turns.reset(this.units),this.events=[],this.pendingAttacks=[],this.pendingAttackCounter=0,this.undoSnapshot=null,this.syncSelection()}syncSelection(){this.selectedUnitId=this.turns.turnState==="player_unit_active"?this.turns.activeUnitId:null}findUnit(t){return this.units.find(e=>e.id===t)}canUnitActNow(t){return!this.turns.isOver&&t.alive&&!t.hasActivatedThisRound&&t.id===this.turns.activeUnitId}canUndoMoveNow(){if(this.turns.isOver||this.turns.turnState!=="player_unit_active")return!1;const t=this.findUnit(this.turns.activeUnitId);return!t||!t.alive||t.team!=="player"||!t.hasMoved||t.hasAttacked||!this.undoSnapshot||this.undoSnapshot.unitId!==t.id||this.undoSnapshot.used?!1:!this.grid.isBlocked(this.undoSnapshot.prevPos,this.units)}activePlayerUnit(){if(this.turns.isOver)return"A batalha já terminou.";if(this.turns.turnState!=="player_unit_active")return"Não é a vez do jogador.";const t=this.findUnit(this.turns.activeUnitId);return!t||!t.alive||t.team!=="player"?"Nenhuma unidade ativa válida.":t}pushCombatEvents(t){for(const e of t)if(this.events.push(e),e.type==="unitDied"){const n=this.pendingAttacks.filter(i=>i.casterId===e.unitId);if(n.length>0){this.pendingAttacks=this.pendingAttacks.filter(i=>i.casterId!==e.unitId);for(const i of n)this.events.push({type:"attackCancelled",pendingAttackId:i.id,casterId:i.casterId,reason:"caster_died"})}}}advanceAndResolvePending(t){this.events.push(...this.turns.advanceTurn(t,this.units)),this.syncSelection(),this.resolvePendingForActiveUnit()}resolvePendingForActiveUnit(){if(this.turns.isOver||!this.turns.activeUnitId)return;const t=this.turns.activeUnitId,e=this.pendingAttacks.filter(r=>r.casterId===t);if(e.length===0)return;this.pendingAttacks=this.pendingAttacks.filter(r=>r.casterId!==t);const n=this.findUnit(t);if(!n||!n.alive)return;for(const r of e)this.pushCombatEvents(Cu(r,n,this.units));const i=this.turns.checkBattleEnd(this.units);this.turns.isOver&&(this.events.push(...i),this.undoSnapshot=null,this.selectedUnitId=null)}postActionCheck(t){const e=this.turns.checkBattleEnd(this.units);if(this.turns.isOver){this.events.push(...e),this.undoSnapshot=null,this.selectedUnitId=null;return}(!t.alive||t.hasMoved&&t.hasAttacked)&&(this.undoSnapshot=null,this.advanceAndResolvePending(t))}}/**
 * @license
 * Copyright 2010-2024 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const gl="170",zu=0,nc=1,Vu=2,Kh=1,jh=2,Yn=3,ti=0,ze=1,oe=2,Ai=0,vs=1,ic=2,sc=3,rc=4,Wu=5,Gi=100,Xu=101,Yu=102,qu=103,$u=104,Ku=200,ju=201,Zu=202,Ju=203,_a=204,va=205,Qu=206,tf=207,ef=208,nf=209,sf=210,rf=211,of=212,af=213,lf=214,xa=0,ya=1,Ma=2,As=3,Sa=4,wa=5,ba=6,Ea=7,Zh=0,cf=1,hf=2,Ti=0,df=1,uf=2,ff=3,Jh=4,pf=5,mf=6,gf=7,oc="attached",_f="detached",Qh=300,Ts=301,Cs=302,Aa=303,Ta=304,yo=306,ln=1e3,Cn=1001,so=1002,Ve=1003,td=1004,er=1005,Qe=1006,jr=1007,jn=1008,ei=1009,ed=1010,nd=1011,lr=1012,_l=1013,qi=1014,yn=1015,fr=1016,vl=1017,xl=1018,Rs=1020,id=35902,sd=1021,rd=1022,cn=1023,od=1024,ad=1025,xs=1026,Is=1027,yl=1028,Ml=1029,ld=1030,Sl=1031,wl=1033,Zr=33776,Jr=33777,Qr=33778,to=33779,Ca=35840,Ra=35841,Ia=35842,Pa=35843,La=36196,Da=37492,Na=37496,Ua=37808,ka=37809,Fa=37810,Oa=37811,Ba=37812,Ha=37813,Ga=37814,za=37815,Va=37816,Wa=37817,Xa=37818,Ya=37819,qa=37820,$a=37821,eo=36492,Ka=36494,ja=36495,cd=36283,Za=36284,Ja=36285,Qa=36286,hd=2200,dd=2201,vf=2202,cr=2300,hr=2301,Ro=2302,ms=2400,gs=2401,ro=2402,bl=2500,xf=2501,yf=0,ud=1,tl=2,Mf=3200,Sf=3201,fd=0,wf=1,Mi="",be="srgb",Ye="srgb-linear",Mo="linear",ce="srgb",Zi=7680,ac=519,bf=512,Ef=513,Af=514,pd=515,Tf=516,Cf=517,Rf=518,If=519,el=35044,lc="300 es",Zn=2e3,oo=2001;class Ki{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){if(this._listeners===void 0)return!1;const n=this._listeners;return n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){if(this._listeners===void 0)return;const i=this._listeners[t];if(i!==void 0){const r=i.indexOf(e);r!==-1&&i.splice(r,1)}}dispatchEvent(t){if(this._listeners===void 0)return;const n=this._listeners[t.type];if(n!==void 0){t.target=this;const i=n.slice(0);for(let r=0,o=i.length;r<o;r++)i[r].call(this,t);t.target=null}}}const Ne=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let cc=1234567;const sr=Math.PI/180,Ps=180/Math.PI;function Mn(){const s=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Ne[s&255]+Ne[s>>8&255]+Ne[s>>16&255]+Ne[s>>24&255]+"-"+Ne[t&255]+Ne[t>>8&255]+"-"+Ne[t>>16&15|64]+Ne[t>>24&255]+"-"+Ne[e&63|128]+Ne[e>>8&255]+"-"+Ne[e>>16&255]+Ne[e>>24&255]+Ne[n&255]+Ne[n>>8&255]+Ne[n>>16&255]+Ne[n>>24&255]).toLowerCase()}function ke(s,t,e){return Math.max(t,Math.min(e,s))}function El(s,t){return(s%t+t)%t}function Pf(s,t,e,n,i){return n+(s-t)*(i-n)/(e-t)}function Lf(s,t,e){return s!==t?(e-s)/(t-s):0}function rr(s,t,e){return(1-e)*s+e*t}function Df(s,t,e,n){return rr(s,t,1-Math.exp(-e*n))}function Nf(s,t=1){return t-Math.abs(El(s,t*2)-t)}function Uf(s,t,e){return s<=t?0:s>=e?1:(s=(s-t)/(e-t),s*s*(3-2*s))}function kf(s,t,e){return s<=t?0:s>=e?1:(s=(s-t)/(e-t),s*s*s*(s*(s*6-15)+10))}function Ff(s,t){return s+Math.floor(Math.random()*(t-s+1))}function Of(s,t){return s+Math.random()*(t-s)}function Bf(s){return s*(.5-Math.random())}function Hf(s){s!==void 0&&(cc=s);let t=cc+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function Gf(s){return s*sr}function zf(s){return s*Ps}function Vf(s){return(s&s-1)===0&&s!==0}function Wf(s){return Math.pow(2,Math.ceil(Math.log(s)/Math.LN2))}function Xf(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}function Yf(s,t,e,n,i){const r=Math.cos,o=Math.sin,a=r(e/2),l=o(e/2),c=r((t+n)/2),h=o((t+n)/2),d=r((t-n)/2),u=o((t-n)/2),f=r((n-t)/2),g=o((n-t)/2);switch(i){case"XYX":s.set(a*h,l*d,l*u,a*c);break;case"YZY":s.set(l*u,a*h,l*d,a*c);break;case"ZXZ":s.set(l*d,l*u,a*h,a*c);break;case"XZX":s.set(a*h,l*g,l*f,a*c);break;case"YXY":s.set(l*f,a*h,l*g,a*c);break;case"ZYZ":s.set(l*g,l*f,a*h,a*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+i)}}function vn(s,t){switch(t.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("Invalid component type.")}}function ae(s,t){switch(t.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("Invalid component type.")}}const qf={DEG2RAD:sr,RAD2DEG:Ps,generateUUID:Mn,clamp:ke,euclideanModulo:El,mapLinear:Pf,inverseLerp:Lf,lerp:rr,damp:Df,pingpong:Nf,smoothstep:Uf,smootherstep:kf,randInt:Ff,randFloat:Of,randFloatSpread:Bf,seededRandom:Hf,degToRad:Gf,radToDeg:zf,isPowerOfTwo:Vf,ceilPowerOfTwo:Wf,floorPowerOfTwo:Xf,setQuaternionFromProperEuler:Yf,normalize:ae,denormalize:vn};class zt{constructor(t=0,e=0){zt.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const e=this.x,n=this.y,i=t.elements;return this.x=i[0]*e+i[3]*n+i[6],this.y=i[1]*e+i[4]*n+i[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(ke(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){const n=Math.cos(e),i=Math.sin(e),r=this.x-t.x,o=this.y-t.y;return this.x=r*n-o*i+t.x,this.y=r*i+o*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Bt{constructor(t,e,n,i,r,o,a,l,c){Bt.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,i,r,o,a,l,c)}set(t,e,n,i,r,o,a,l,c){const h=this.elements;return h[0]=t,h[1]=i,h[2]=a,h[3]=e,h[4]=r,h[5]=l,h[6]=n,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,i=e.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],h=n[4],d=n[7],u=n[2],f=n[5],g=n[8],_=i[0],m=i[3],p=i[6],y=i[1],M=i[4],v=i[7],I=i[2],T=i[5],E=i[8];return r[0]=o*_+a*y+l*I,r[3]=o*m+a*M+l*T,r[6]=o*p+a*v+l*E,r[1]=c*_+h*y+d*I,r[4]=c*m+h*M+d*T,r[7]=c*p+h*v+d*E,r[2]=u*_+f*y+g*I,r[5]=u*m+f*M+g*T,r[8]=u*p+f*v+g*E,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[1],i=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8];return e*o*h-e*a*c-n*r*h+n*a*l+i*r*c-i*o*l}invert(){const t=this.elements,e=t[0],n=t[1],i=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],d=h*o-a*c,u=a*l-h*r,f=c*r-o*l,g=e*d+n*u+i*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const _=1/g;return t[0]=d*_,t[1]=(i*c-h*n)*_,t[2]=(a*n-i*o)*_,t[3]=u*_,t[4]=(h*e-i*l)*_,t[5]=(i*r-a*e)*_,t[6]=f*_,t[7]=(n*l-c*e)*_,t[8]=(o*e-n*r)*_,this}transpose(){let t;const e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,i,r,o,a){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+t,-i*c,i*l,-i*(-c*o+l*a)+a+e,0,0,1),this}scale(t,e){return this.premultiply(Io.makeScale(t,e)),this}rotate(t){return this.premultiply(Io.makeRotation(-t)),this}translate(t,e){return this.premultiply(Io.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){const e=this.elements,n=t.elements;for(let i=0;i<9;i++)if(e[i]!==n[i])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}}const Io=new Bt;function md(s){for(let t=s.length-1;t>=0;--t)if(s[t]>=65535)return!0;return!1}function dr(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function $f(){const s=dr("canvas");return s.style.display="block",s}const hc={};function nr(s){s in hc||(hc[s]=!0,console.warn(s))}function Kf(s,t,e){return new Promise(function(n,i){function r(){switch(s.clientWaitSync(t,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:i();break;case s.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}function jf(s){const t=s.elements;t[2]=.5*t[2]+.5*t[3],t[6]=.5*t[6]+.5*t[7],t[10]=.5*t[10]+.5*t[11],t[14]=.5*t[14]+.5*t[15]}function Zf(s){const t=s.elements;t[11]===-1?(t[10]=-t[10]-1,t[14]=-t[14]):(t[10]=-t[10],t[14]=-t[14]+1)}const qt={enabled:!0,workingColorSpace:Ye,spaces:{},convert:function(s,t,e){return this.enabled===!1||t===e||!t||!e||(this.spaces[t].transfer===ce&&(s.r=Qn(s.r),s.g=Qn(s.g),s.b=Qn(s.b)),this.spaces[t].primaries!==this.spaces[e].primaries&&(s.applyMatrix3(this.spaces[t].toXYZ),s.applyMatrix3(this.spaces[e].fromXYZ)),this.spaces[e].transfer===ce&&(s.r=ys(s.r),s.g=ys(s.g),s.b=ys(s.b))),s},fromWorkingColorSpace:function(s,t){return this.convert(s,this.workingColorSpace,t)},toWorkingColorSpace:function(s,t){return this.convert(s,t,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Mi?Mo:this.spaces[s].transfer},getLuminanceCoefficients:function(s,t=this.workingColorSpace){return s.fromArray(this.spaces[t].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,t,e){return s.copy(this.spaces[t].toXYZ).multiply(this.spaces[e].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace}};function Qn(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function ys(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}const dc=[.64,.33,.3,.6,.15,.06],uc=[.2126,.7152,.0722],fc=[.3127,.329],pc=new Bt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),mc=new Bt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);qt.define({[Ye]:{primaries:dc,whitePoint:fc,transfer:Mo,toXYZ:pc,fromXYZ:mc,luminanceCoefficients:uc,workingColorSpaceConfig:{unpackColorSpace:be},outputColorSpaceConfig:{drawingBufferColorSpace:be}},[be]:{primaries:dc,whitePoint:fc,transfer:ce,toXYZ:pc,fromXYZ:mc,luminanceCoefficients:uc,outputColorSpaceConfig:{drawingBufferColorSpace:be}}});let Ji;class Jf{static getDataURL(t){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let e;if(t instanceof HTMLCanvasElement)e=t;else{Ji===void 0&&(Ji=dr("canvas")),Ji.width=t.width,Ji.height=t.height;const n=Ji.getContext("2d");t instanceof ImageData?n.putImageData(t,0,0):n.drawImage(t,0,0,t.width,t.height),e=Ji}return e.width>2048||e.height>2048?(console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons",t),e.toDataURL("image/jpeg",.6)):e.toDataURL("image/png")}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const e=dr("canvas");e.width=t.width,e.height=t.height;const n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);const i=n.getImageData(0,0,t.width,t.height),r=i.data;for(let o=0;o<r.length;o++)r[o]=Qn(r[o]/255)*255;return n.putImageData(i,0,0),e}else if(t.data){const e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(Qn(e[n]/255)*255):e[n]=Qn(e[n]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}let Qf=0;class gd{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Qf++}),this.uuid=Mn(),this.data=t,this.dataReady=!0,this.version=0}set needsUpdate(t){t===!0&&this.version++}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];const n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let r;if(Array.isArray(i)){r=[];for(let o=0,a=i.length;o<a;o++)i[o].isDataTexture?r.push(Po(i[o].image)):r.push(Po(i[o]))}else r=Po(i);n.url=r}return e||(t.images[this.uuid]=n),n}}function Po(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?Jf.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let tp=0;class Te extends Ki{constructor(t=Te.DEFAULT_IMAGE,e=Te.DEFAULT_MAPPING,n=Cn,i=Cn,r=Qe,o=jn,a=cn,l=ei,c=Te.DEFAULT_ANISOTROPY,h=Mi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:tp++}),this.uuid=Mn(),this.name="",this.source=new gd(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new zt(0,0),this.repeat=new zt(1,1),this.center=new zt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Bt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.version=0,this.onUpdate=null,this.isRenderTargetTexture=!1,this.pmremVersion=0}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const n={metadata:{version:4.6,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==Qh)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case ln:t.x=t.x-Math.floor(t.x);break;case Cn:t.x=t.x<0?0:1;break;case so:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case ln:t.y=t.y-Math.floor(t.y);break;case Cn:t.y=t.y<0?0:1;break;case so:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}}Te.DEFAULT_IMAGE=null;Te.DEFAULT_MAPPING=Qh;Te.DEFAULT_ANISOTROPY=1;class ee{constructor(t=0,e=0,n=0,i=1){ee.prototype.isVector4=!0,this.x=t,this.y=e,this.z=n,this.w=i}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,i){return this.x=t,this.y=e,this.z=n,this.w=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const e=this.x,n=this.y,i=this.z,r=this.w,o=t.elements;return this.x=o[0]*e+o[4]*n+o[8]*i+o[12]*r,this.y=o[1]*e+o[5]*n+o[9]*i+o[13]*r,this.z=o[2]*e+o[6]*n+o[10]*i+o[14]*r,this.w=o[3]*e+o[7]*n+o[11]*i+o[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,i,r;const l=t.elements,c=l[0],h=l[4],d=l[8],u=l[1],f=l[5],g=l[9],_=l[2],m=l[6],p=l[10];if(Math.abs(h-u)<.01&&Math.abs(d-_)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+u)<.1&&Math.abs(d+_)<.1&&Math.abs(g+m)<.1&&Math.abs(c+f+p-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;const M=(c+1)/2,v=(f+1)/2,I=(p+1)/2,T=(h+u)/4,E=(d+_)/4,C=(g+m)/4;return M>v&&M>I?M<.01?(n=0,i=.707106781,r=.707106781):(n=Math.sqrt(M),i=T/n,r=E/n):v>I?v<.01?(n=.707106781,i=0,r=.707106781):(i=Math.sqrt(v),n=T/i,r=C/i):I<.01?(n=.707106781,i=.707106781,r=0):(r=Math.sqrt(I),n=E/r,i=C/r),this.set(n,i,r,e),this}let y=Math.sqrt((m-g)*(m-g)+(d-_)*(d-_)+(u-h)*(u-h));return Math.abs(y)<.001&&(y=1),this.x=(m-g)/y,this.y=(d-_)/y,this.z=(u-h)/y,this.w=Math.acos((c+f+p-1)/2),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this.w=Math.max(t.w,Math.min(e.w,this.w)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this.w=Math.max(t,Math.min(e,this.w)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class ep extends Ki{constructor(t=1,e=1,n={}){super(),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=1,this.scissor=new ee(0,0,t,e),this.scissorTest=!1,this.viewport=new ee(0,0,t,e);const i={width:t,height:e,depth:1};n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Qe,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1},n);const r=new Te(i,n.mapping,n.wrapS,n.wrapT,n.magFilter,n.minFilter,n.format,n.type,n.anisotropy,n.colorSpace);r.flipY=!1,r.generateMipmaps=n.generateMipmaps,r.internalFormat=n.internalFormat,this.textures=[];const o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0;this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.depthTexture=n.depthTexture,this.samples=n.samples}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let i=0,r=this.textures.length;i<r;i++)this.textures[i].image.width=t,this.textures[i].image.height=e,this.textures[i].image.depth=n;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let n=0,i=t.textures.length;n<i;n++)this.textures[n]=t.textures[n].clone(),this.textures[n].isRenderTargetTexture=!0;const e=Object.assign({},t.texture.image);return this.texture.source=new gd(e),this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class $i extends ep{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}}class _d extends Te{constructor(t=null,e=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:i},this.magFilter=Ve,this.minFilter=Ve,this.wrapR=Cn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class np extends Te{constructor(t=null,e=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:i},this.magFilter=Ve,this.minFilter=Ve,this.wrapR=Cn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Sn{constructor(t=0,e=0,n=0,i=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=i}static slerpFlat(t,e,n,i,r,o,a){let l=n[i+0],c=n[i+1],h=n[i+2],d=n[i+3];const u=r[o+0],f=r[o+1],g=r[o+2],_=r[o+3];if(a===0){t[e+0]=l,t[e+1]=c,t[e+2]=h,t[e+3]=d;return}if(a===1){t[e+0]=u,t[e+1]=f,t[e+2]=g,t[e+3]=_;return}if(d!==_||l!==u||c!==f||h!==g){let m=1-a;const p=l*u+c*f+h*g+d*_,y=p>=0?1:-1,M=1-p*p;if(M>Number.EPSILON){const I=Math.sqrt(M),T=Math.atan2(I,p*y);m=Math.sin(m*T)/I,a=Math.sin(a*T)/I}const v=a*y;if(l=l*m+u*v,c=c*m+f*v,h=h*m+g*v,d=d*m+_*v,m===1-a){const I=1/Math.sqrt(l*l+c*c+h*h+d*d);l*=I,c*=I,h*=I,d*=I}}t[e]=l,t[e+1]=c,t[e+2]=h,t[e+3]=d}static multiplyQuaternionsFlat(t,e,n,i,r,o){const a=n[i],l=n[i+1],c=n[i+2],h=n[i+3],d=r[o],u=r[o+1],f=r[o+2],g=r[o+3];return t[e]=a*g+h*d+l*f-c*u,t[e+1]=l*g+h*u+c*d-a*f,t[e+2]=c*g+h*f+a*u-l*d,t[e+3]=h*g-a*d-l*u-c*f,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,i){return this._x=t,this._y=e,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){const n=t._x,i=t._y,r=t._z,o=t._order,a=Math.cos,l=Math.sin,c=a(n/2),h=a(i/2),d=a(r/2),u=l(n/2),f=l(i/2),g=l(r/2);switch(o){case"XYZ":this._x=u*h*d+c*f*g,this._y=c*f*d-u*h*g,this._z=c*h*g+u*f*d,this._w=c*h*d-u*f*g;break;case"YXZ":this._x=u*h*d+c*f*g,this._y=c*f*d-u*h*g,this._z=c*h*g-u*f*d,this._w=c*h*d+u*f*g;break;case"ZXY":this._x=u*h*d-c*f*g,this._y=c*f*d+u*h*g,this._z=c*h*g+u*f*d,this._w=c*h*d-u*f*g;break;case"ZYX":this._x=u*h*d-c*f*g,this._y=c*f*d+u*h*g,this._z=c*h*g-u*f*d,this._w=c*h*d+u*f*g;break;case"YZX":this._x=u*h*d+c*f*g,this._y=c*f*d+u*h*g,this._z=c*h*g-u*f*d,this._w=c*h*d-u*f*g;break;case"XZY":this._x=u*h*d-c*f*g,this._y=c*f*d-u*h*g,this._z=c*h*g+u*f*d,this._w=c*h*d+u*f*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){const n=e/2,i=Math.sin(n);return this._x=t.x*i,this._y=t.y*i,this._z=t.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){const e=t.elements,n=e[0],i=e[4],r=e[8],o=e[1],a=e[5],l=e[9],c=e[2],h=e[6],d=e[10],u=n+a+d;if(u>0){const f=.5/Math.sqrt(u+1);this._w=.25/f,this._x=(h-l)*f,this._y=(r-c)*f,this._z=(o-i)*f}else if(n>a&&n>d){const f=2*Math.sqrt(1+n-a-d);this._w=(h-l)/f,this._x=.25*f,this._y=(i+o)/f,this._z=(r+c)/f}else if(a>d){const f=2*Math.sqrt(1+a-n-d);this._w=(r-c)/f,this._x=(i+o)/f,this._y=.25*f,this._z=(l+h)/f}else{const f=2*Math.sqrt(1+d-n-a);this._w=(o-i)/f,this._x=(r+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<Number.EPSILON?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(ke(this.dot(t),-1,1)))}rotateTowards(t,e){const n=this.angleTo(t);if(n===0)return this;const i=Math.min(1,e/n);return this.slerp(t,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){const n=t._x,i=t._y,r=t._z,o=t._w,a=e._x,l=e._y,c=e._z,h=e._w;return this._x=n*h+o*a+i*c-r*l,this._y=i*h+o*l+r*a-n*c,this._z=r*h+o*c+n*l-i*a,this._w=o*h-n*a-i*l-r*c,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);const n=this._x,i=this._y,r=this._z,o=this._w;let a=o*t._w+n*t._x+i*t._y+r*t._z;if(a<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,a=-a):this.copy(t),a>=1)return this._w=o,this._x=n,this._y=i,this._z=r,this;const l=1-a*a;if(l<=Number.EPSILON){const f=1-e;return this._w=f*o+e*this._w,this._x=f*n+e*this._x,this._y=f*i+e*this._y,this._z=f*r+e*this._z,this.normalize(),this}const c=Math.sqrt(l),h=Math.atan2(c,a),d=Math.sin((1-e)*h)/c,u=Math.sin(e*h)/c;return this._w=o*d+this._w*u,this._x=n*d+this._x*u,this._y=i*d+this._y*u,this._z=r*d+this._z*u,this._onChangeCallback(),this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){const t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(i*Math.sin(t),i*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class L{constructor(t=0,e=0,n=0){L.prototype.isVector3=!0,this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(gc.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(gc.setFromAxisAngle(t,e))}applyMatrix3(t){const e=this.x,n=this.y,i=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*i,this.y=r[1]*e+r[4]*n+r[7]*i,this.z=r[2]*e+r[5]*n+r[8]*i,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const e=this.x,n=this.y,i=this.z,r=t.elements,o=1/(r[3]*e+r[7]*n+r[11]*i+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*i+r[12])*o,this.y=(r[1]*e+r[5]*n+r[9]*i+r[13])*o,this.z=(r[2]*e+r[6]*n+r[10]*i+r[14])*o,this}applyQuaternion(t){const e=this.x,n=this.y,i=this.z,r=t.x,o=t.y,a=t.z,l=t.w,c=2*(o*i-a*n),h=2*(a*e-r*i),d=2*(r*n-o*e);return this.x=e+l*c+o*d-a*h,this.y=n+l*h+a*c-r*d,this.z=i+l*d+r*h-o*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const e=this.x,n=this.y,i=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*i,this.y=r[1]*e+r[5]*n+r[9]*i,this.z=r[2]*e+r[6]*n+r[10]*i,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Math.max(t.x,Math.min(e.x,this.x)),this.y=Math.max(t.y,Math.min(e.y,this.y)),this.z=Math.max(t.z,Math.min(e.z,this.z)),this}clampScalar(t,e){return this.x=Math.max(t,Math.min(e,this.x)),this.y=Math.max(t,Math.min(e,this.y)),this.z=Math.max(t,Math.min(e,this.z)),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar(Math.max(t,Math.min(e,n)))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){const n=t.x,i=t.y,r=t.z,o=e.x,a=e.y,l=e.z;return this.x=i*l-r*a,this.y=r*o-n*l,this.z=n*a-i*o,this}projectOnVector(t){const e=t.lengthSq();if(e===0)return this.set(0,0,0);const n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return Lo.copy(this).projectOnVector(t),this.sub(Lo)}reflect(t){return this.sub(Lo.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos(ke(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y,i=this.z-t.z;return e*e+n*n+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){const i=Math.sin(e)*t;return this.x=i*Math.sin(n),this.y=Math.cos(e)*t,this.z=i*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){const e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),i=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=i,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Lo=new L,gc=new Sn;class wn{constructor(t=new L(1/0,1/0,1/0),e=new L(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(fn.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(fn.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){const n=fn.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);const n=t.geometry;if(n!==void 0){const r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,fn):fn.fromBufferAttribute(r,o),fn.applyMatrix4(t.matrixWorld),this.expandByPoint(fn);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Mr.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Mr.copy(n.boundingBox)),Mr.applyMatrix4(t.matrixWorld),this.union(Mr)}const i=t.children;for(let r=0,o=i.length;r<o;r++)this.expandByObject(i[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,fn),fn.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Vs),Sr.subVectors(this.max,Vs),Qi.subVectors(t.a,Vs),ts.subVectors(t.b,Vs),es.subVectors(t.c,Vs),ci.subVectors(ts,Qi),hi.subVectors(es,ts),Li.subVectors(Qi,es);let e=[0,-ci.z,ci.y,0,-hi.z,hi.y,0,-Li.z,Li.y,ci.z,0,-ci.x,hi.z,0,-hi.x,Li.z,0,-Li.x,-ci.y,ci.x,0,-hi.y,hi.x,0,-Li.y,Li.x,0];return!Do(e,Qi,ts,es,Sr)||(e=[1,0,0,0,1,0,0,0,1],!Do(e,Qi,ts,es,Sr))?!1:(wr.crossVectors(ci,hi),e=[wr.x,wr.y,wr.z],Do(e,Qi,ts,es,Sr))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,fn).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(fn).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Hn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Hn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Hn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Hn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Hn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Hn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Hn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Hn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Hn),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}}const Hn=[new L,new L,new L,new L,new L,new L,new L,new L],fn=new L,Mr=new wn,Qi=new L,ts=new L,es=new L,ci=new L,hi=new L,Li=new L,Vs=new L,Sr=new L,wr=new L,Di=new L;function Do(s,t,e,n,i){for(let r=0,o=s.length-3;r<=o;r+=3){Di.fromArray(s,r);const a=i.x*Math.abs(Di.x)+i.y*Math.abs(Di.y)+i.z*Math.abs(Di.z),l=t.dot(Di),c=e.dot(Di),h=n.dot(Di);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}const ip=new wn,Ws=new L,No=new L;class Dn{constructor(t=new L,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){const n=this.center;e!==void 0?n.copy(e):ip.setFromPoints(t).getCenter(n);let i=0;for(let r=0,o=t.length;r<o;r++)i=Math.max(i,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(i),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){const e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){const n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Ws.subVectors(t,this.center);const e=Ws.lengthSq();if(e>this.radius*this.radius){const n=Math.sqrt(e),i=(n-this.radius)*.5;this.center.addScaledVector(Ws,i/n),this.radius+=i}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(No.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Ws.copy(t.center).add(No)),this.expandByPoint(Ws.copy(t.center).sub(No))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}}const Gn=new L,Uo=new L,br=new L,di=new L,ko=new L,Er=new L,Fo=new L;class pr{constructor(t=new L,e=new L(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Gn)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);const n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){const e=Gn.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Gn.copy(this.origin).addScaledVector(this.direction,e),Gn.distanceToSquared(t))}distanceSqToSegment(t,e,n,i){Uo.copy(t).add(e).multiplyScalar(.5),br.copy(e).sub(t).normalize(),di.copy(this.origin).sub(Uo);const r=t.distanceTo(e)*.5,o=-this.direction.dot(br),a=di.dot(this.direction),l=-di.dot(br),c=di.lengthSq(),h=Math.abs(1-o*o);let d,u,f,g;if(h>0)if(d=o*l-a,u=o*a-l,g=r*h,d>=0)if(u>=-g)if(u<=g){const _=1/h;d*=_,u*=_,f=d*(d+o*u+2*a)+u*(o*d+u+2*l)+c}else u=r,d=Math.max(0,-(o*u+a)),f=-d*d+u*(u+2*l)+c;else u=-r,d=Math.max(0,-(o*u+a)),f=-d*d+u*(u+2*l)+c;else u<=-g?(d=Math.max(0,-(-o*r+a)),u=d>0?-r:Math.min(Math.max(-r,-l),r),f=-d*d+u*(u+2*l)+c):u<=g?(d=0,u=Math.min(Math.max(-r,-l),r),f=u*(u+2*l)+c):(d=Math.max(0,-(o*r+a)),u=d>0?r:Math.min(Math.max(-r,-l),r),f=-d*d+u*(u+2*l)+c);else u=o>0?-r:r,d=Math.max(0,-(o*u+a)),f=-d*d+u*(u+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,d),i&&i.copy(Uo).addScaledVector(br,u),f}intersectSphere(t,e){Gn.subVectors(t.center,this.origin);const n=Gn.dot(this.direction),i=Gn.dot(Gn)-n*n,r=t.radius*t.radius;if(i>r)return null;const o=Math.sqrt(r-i),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,e):this.at(a,e)}intersectsSphere(t){return this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){const e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){const n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){const e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,i,r,o,a,l;const c=1/this.direction.x,h=1/this.direction.y,d=1/this.direction.z,u=this.origin;return c>=0?(n=(t.min.x-u.x)*c,i=(t.max.x-u.x)*c):(n=(t.max.x-u.x)*c,i=(t.min.x-u.x)*c),h>=0?(r=(t.min.y-u.y)*h,o=(t.max.y-u.y)*h):(r=(t.max.y-u.y)*h,o=(t.min.y-u.y)*h),n>o||r>i||((r>n||isNaN(n))&&(n=r),(o<i||isNaN(i))&&(i=o),d>=0?(a=(t.min.z-u.z)*d,l=(t.max.z-u.z)*d):(a=(t.max.z-u.z)*d,l=(t.min.z-u.z)*d),n>l||a>i)||((a>n||n!==n)&&(n=a),(l<i||i!==i)&&(i=l),i<0)?null:this.at(n>=0?n:i,e)}intersectsBox(t){return this.intersectBox(t,Gn)!==null}intersectTriangle(t,e,n,i,r){ko.subVectors(e,t),Er.subVectors(n,t),Fo.crossVectors(ko,Er);let o=this.direction.dot(Fo),a;if(o>0){if(i)return null;a=1}else if(o<0)a=-1,o=-o;else return null;di.subVectors(this.origin,t);const l=a*this.direction.dot(Er.crossVectors(di,Er));if(l<0)return null;const c=a*this.direction.dot(ko.cross(di));if(c<0||l+c>o)return null;const h=-a*di.dot(Fo);return h<0?null:this.at(h/o,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class kt{constructor(t,e,n,i,r,o,a,l,c,h,d,u,f,g,_,m){kt.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,i,r,o,a,l,c,h,d,u,f,g,_,m)}set(t,e,n,i,r,o,a,l,c,h,d,u,f,g,_,m){const p=this.elements;return p[0]=t,p[4]=e,p[8]=n,p[12]=i,p[1]=r,p[5]=o,p[9]=a,p[13]=l,p[2]=c,p[6]=h,p[10]=d,p[14]=u,p[3]=f,p[7]=g,p[11]=_,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new kt().fromArray(this.elements)}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){const e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){const e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){const e=this.elements,n=t.elements,i=1/ns.setFromMatrixColumn(t,0).length(),r=1/ns.setFromMatrixColumn(t,1).length(),o=1/ns.setFromMatrixColumn(t,2).length();return e[0]=n[0]*i,e[1]=n[1]*i,e[2]=n[2]*i,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*o,e[9]=n[9]*o,e[10]=n[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){const e=this.elements,n=t.x,i=t.y,r=t.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(i),c=Math.sin(i),h=Math.cos(r),d=Math.sin(r);if(t.order==="XYZ"){const u=o*h,f=o*d,g=a*h,_=a*d;e[0]=l*h,e[4]=-l*d,e[8]=c,e[1]=f+g*c,e[5]=u-_*c,e[9]=-a*l,e[2]=_-u*c,e[6]=g+f*c,e[10]=o*l}else if(t.order==="YXZ"){const u=l*h,f=l*d,g=c*h,_=c*d;e[0]=u+_*a,e[4]=g*a-f,e[8]=o*c,e[1]=o*d,e[5]=o*h,e[9]=-a,e[2]=f*a-g,e[6]=_+u*a,e[10]=o*l}else if(t.order==="ZXY"){const u=l*h,f=l*d,g=c*h,_=c*d;e[0]=u-_*a,e[4]=-o*d,e[8]=g+f*a,e[1]=f+g*a,e[5]=o*h,e[9]=_-u*a,e[2]=-o*c,e[6]=a,e[10]=o*l}else if(t.order==="ZYX"){const u=o*h,f=o*d,g=a*h,_=a*d;e[0]=l*h,e[4]=g*c-f,e[8]=u*c+_,e[1]=l*d,e[5]=_*c+u,e[9]=f*c-g,e[2]=-c,e[6]=a*l,e[10]=o*l}else if(t.order==="YZX"){const u=o*l,f=o*c,g=a*l,_=a*c;e[0]=l*h,e[4]=_-u*d,e[8]=g*d+f,e[1]=d,e[5]=o*h,e[9]=-a*h,e[2]=-c*h,e[6]=f*d+g,e[10]=u-_*d}else if(t.order==="XZY"){const u=o*l,f=o*c,g=a*l,_=a*c;e[0]=l*h,e[4]=-d,e[8]=c*h,e[1]=u*d+_,e[5]=o*h,e[9]=f*d-g,e[2]=g*d-f,e[6]=a*h,e[10]=_*d+u}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(sp,t,rp)}lookAt(t,e,n){const i=this.elements;return Ze.subVectors(t,e),Ze.lengthSq()===0&&(Ze.z=1),Ze.normalize(),ui.crossVectors(n,Ze),ui.lengthSq()===0&&(Math.abs(n.z)===1?Ze.x+=1e-4:Ze.z+=1e-4,Ze.normalize(),ui.crossVectors(n,Ze)),ui.normalize(),Ar.crossVectors(Ze,ui),i[0]=ui.x,i[4]=Ar.x,i[8]=Ze.x,i[1]=ui.y,i[5]=Ar.y,i[9]=Ze.y,i[2]=ui.z,i[6]=Ar.z,i[10]=Ze.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,i=e.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],h=n[1],d=n[5],u=n[9],f=n[13],g=n[2],_=n[6],m=n[10],p=n[14],y=n[3],M=n[7],v=n[11],I=n[15],T=i[0],E=i[4],C=i[8],S=i[12],x=i[1],P=i[5],F=i[9],N=i[13],H=i[2],z=i[6],V=i[10],J=i[14],W=i[3],rt=i[7],ft=i[11],At=i[15];return r[0]=o*T+a*x+l*H+c*W,r[4]=o*E+a*P+l*z+c*rt,r[8]=o*C+a*F+l*V+c*ft,r[12]=o*S+a*N+l*J+c*At,r[1]=h*T+d*x+u*H+f*W,r[5]=h*E+d*P+u*z+f*rt,r[9]=h*C+d*F+u*V+f*ft,r[13]=h*S+d*N+u*J+f*At,r[2]=g*T+_*x+m*H+p*W,r[6]=g*E+_*P+m*z+p*rt,r[10]=g*C+_*F+m*V+p*ft,r[14]=g*S+_*N+m*J+p*At,r[3]=y*T+M*x+v*H+I*W,r[7]=y*E+M*P+v*z+I*rt,r[11]=y*C+M*F+v*V+I*ft,r[15]=y*S+M*N+v*J+I*At,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[4],i=t[8],r=t[12],o=t[1],a=t[5],l=t[9],c=t[13],h=t[2],d=t[6],u=t[10],f=t[14],g=t[3],_=t[7],m=t[11],p=t[15];return g*(+r*l*d-i*c*d-r*a*u+n*c*u+i*a*f-n*l*f)+_*(+e*l*f-e*c*u+r*o*u-i*o*f+i*c*h-r*l*h)+m*(+e*c*d-e*a*f-r*o*d+n*o*f+r*a*h-n*c*h)+p*(-i*a*h-e*l*d+e*a*u+i*o*d-n*o*u+n*l*h)}transpose(){const t=this.elements;let e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){const i=this.elements;return t.isVector3?(i[12]=t.x,i[13]=t.y,i[14]=t.z):(i[12]=t,i[13]=e,i[14]=n),this}invert(){const t=this.elements,e=t[0],n=t[1],i=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],h=t[8],d=t[9],u=t[10],f=t[11],g=t[12],_=t[13],m=t[14],p=t[15],y=d*m*c-_*u*c+_*l*f-a*m*f-d*l*p+a*u*p,M=g*u*c-h*m*c-g*l*f+o*m*f+h*l*p-o*u*p,v=h*_*c-g*d*c+g*a*f-o*_*f-h*a*p+o*d*p,I=g*d*l-h*_*l-g*a*u+o*_*u+h*a*m-o*d*m,T=e*y+n*M+i*v+r*I;if(T===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const E=1/T;return t[0]=y*E,t[1]=(_*u*r-d*m*r-_*i*f+n*m*f+d*i*p-n*u*p)*E,t[2]=(a*m*r-_*l*r+_*i*c-n*m*c-a*i*p+n*l*p)*E,t[3]=(d*l*r-a*u*r-d*i*c+n*u*c+a*i*f-n*l*f)*E,t[4]=M*E,t[5]=(h*m*r-g*u*r+g*i*f-e*m*f-h*i*p+e*u*p)*E,t[6]=(g*l*r-o*m*r-g*i*c+e*m*c+o*i*p-e*l*p)*E,t[7]=(o*u*r-h*l*r+h*i*c-e*u*c-o*i*f+e*l*f)*E,t[8]=v*E,t[9]=(g*d*r-h*_*r-g*n*f+e*_*f+h*n*p-e*d*p)*E,t[10]=(o*_*r-g*a*r+g*n*c-e*_*c-o*n*p+e*a*p)*E,t[11]=(h*a*r-o*d*r-h*n*c+e*d*c+o*n*f-e*a*f)*E,t[12]=I*E,t[13]=(h*_*i-g*d*i+g*n*u-e*_*u-h*n*m+e*d*m)*E,t[14]=(g*a*i-o*_*i-g*n*l+e*_*l+o*n*m-e*a*m)*E,t[15]=(o*d*i-h*a*i+h*n*l-e*d*l-o*n*u+e*a*u)*E,this}scale(t){const e=this.elements,n=t.x,i=t.y,r=t.z;return e[0]*=n,e[4]*=i,e[8]*=r,e[1]*=n,e[5]*=i,e[9]*=r,e[2]*=n,e[6]*=i,e[10]*=r,e[3]*=n,e[7]*=i,e[11]*=r,this}getMaxScaleOnAxis(){const t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],i=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,i))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){const e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){const n=Math.cos(e),i=Math.sin(e),r=1-n,o=t.x,a=t.y,l=t.z,c=r*o,h=r*a;return this.set(c*o+n,c*a-i*l,c*l+i*a,0,c*a+i*l,h*a+n,h*l-i*o,0,c*l-i*a,h*l+i*o,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,i,r,o){return this.set(1,n,r,0,t,1,o,0,e,i,1,0,0,0,0,1),this}compose(t,e,n){const i=this.elements,r=e._x,o=e._y,a=e._z,l=e._w,c=r+r,h=o+o,d=a+a,u=r*c,f=r*h,g=r*d,_=o*h,m=o*d,p=a*d,y=l*c,M=l*h,v=l*d,I=n.x,T=n.y,E=n.z;return i[0]=(1-(_+p))*I,i[1]=(f+v)*I,i[2]=(g-M)*I,i[3]=0,i[4]=(f-v)*T,i[5]=(1-(u+p))*T,i[6]=(m+y)*T,i[7]=0,i[8]=(g+M)*E,i[9]=(m-y)*E,i[10]=(1-(u+_))*E,i[11]=0,i[12]=t.x,i[13]=t.y,i[14]=t.z,i[15]=1,this}decompose(t,e,n){const i=this.elements;let r=ns.set(i[0],i[1],i[2]).length();const o=ns.set(i[4],i[5],i[6]).length(),a=ns.set(i[8],i[9],i[10]).length();this.determinant()<0&&(r=-r),t.x=i[12],t.y=i[13],t.z=i[14],pn.copy(this);const c=1/r,h=1/o,d=1/a;return pn.elements[0]*=c,pn.elements[1]*=c,pn.elements[2]*=c,pn.elements[4]*=h,pn.elements[5]*=h,pn.elements[6]*=h,pn.elements[8]*=d,pn.elements[9]*=d,pn.elements[10]*=d,e.setFromRotationMatrix(pn),n.x=r,n.y=o,n.z=a,this}makePerspective(t,e,n,i,r,o,a=Zn){const l=this.elements,c=2*r/(e-t),h=2*r/(n-i),d=(e+t)/(e-t),u=(n+i)/(n-i);let f,g;if(a===Zn)f=-(o+r)/(o-r),g=-2*o*r/(o-r);else if(a===oo)f=-o/(o-r),g=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=c,l[4]=0,l[8]=d,l[12]=0,l[1]=0,l[5]=h,l[9]=u,l[13]=0,l[2]=0,l[6]=0,l[10]=f,l[14]=g,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,e,n,i,r,o,a=Zn){const l=this.elements,c=1/(e-t),h=1/(n-i),d=1/(o-r),u=(e+t)*c,f=(n+i)*h;let g,_;if(a===Zn)g=(o+r)*d,_=-2*d;else if(a===oo)g=r*d,_=-1*d;else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=2*c,l[4]=0,l[8]=0,l[12]=-u,l[1]=0,l[5]=2*h,l[9]=0,l[13]=-f,l[2]=0,l[6]=0,l[10]=_,l[14]=-g,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){const e=this.elements,n=t.elements;for(let i=0;i<16;i++)if(e[i]!==n[i])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}}const ns=new L,pn=new kt,sp=new L(0,0,0),rp=new L(1,1,1),ui=new L,Ar=new L,Ze=new L,_c=new kt,vc=new Sn;class Pn{constructor(t=0,e=0,n=0,i=Pn.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=i}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,i=this._order){return this._x=t,this._y=e,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){const i=t.elements,r=i[0],o=i[4],a=i[8],l=i[1],c=i[5],h=i[9],d=i[2],u=i[6],f=i[10];switch(e){case"XYZ":this._y=Math.asin(ke(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-ke(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-d,r),this._z=0);break;case"ZXY":this._x=Math.asin(ke(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-d,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-ke(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(u,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(ke(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-d,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-ke(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return _c.makeRotationFromQuaternion(t),this.setFromRotationMatrix(_c,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return vc.setFromEuler(this),this.setFromQuaternion(vc,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Pn.DEFAULT_ORDER="XYZ";class Al{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}let op=0;const xc=new L,is=new Sn,zn=new kt,Tr=new L,Xs=new L,ap=new L,lp=new Sn,yc=new L(1,0,0),Mc=new L(0,1,0),Sc=new L(0,0,1),wc={type:"added"},cp={type:"removed"},ss={type:"childadded",child:null},Oo={type:"childremoved",child:null};class ve extends Ki{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:op++}),this.uuid=Mn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=ve.DEFAULT_UP.clone();const t=new L,e=new Pn,n=new Sn,i=new L(1,1,1);function r(){n.setFromEuler(e,!1)}function o(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new kt},normalMatrix:{value:new Bt}}),this.matrix=new kt,this.matrixWorld=new kt,this.matrixAutoUpdate=ve.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=ve.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Al,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return is.setFromAxisAngle(t,e),this.quaternion.multiply(is),this}rotateOnWorldAxis(t,e){return is.setFromAxisAngle(t,e),this.quaternion.premultiply(is),this}rotateX(t){return this.rotateOnAxis(yc,t)}rotateY(t){return this.rotateOnAxis(Mc,t)}rotateZ(t){return this.rotateOnAxis(Sc,t)}translateOnAxis(t,e){return xc.copy(t).applyQuaternion(this.quaternion),this.position.add(xc.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(yc,t)}translateY(t){return this.translateOnAxis(Mc,t)}translateZ(t){return this.translateOnAxis(Sc,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(zn.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?Tr.copy(t):Tr.set(t,e,n);const i=this.parent;this.updateWorldMatrix(!0,!1),Xs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?zn.lookAt(Xs,Tr,this.up):zn.lookAt(Tr,Xs,this.up),this.quaternion.setFromRotationMatrix(zn),i&&(zn.extractRotation(i.matrixWorld),is.setFromRotationMatrix(zn),this.quaternion.premultiply(is.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(wc),ss.child=t,this.dispatchEvent(ss),ss.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(cp),Oo.child=t,this.dispatchEvent(Oo),Oo.child=null),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),zn.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),zn.multiply(t.parent.matrixWorld)),t.applyMatrix4(zn),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(wc),ss.child=t,this.dispatchEvent(ss),ss.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,i=this.children.length;n<i;n++){const o=this.children[n].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);const i=this.children;for(let r=0,o=i.length;r<o;r++)i[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Xs,t,ap),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Xs,lp,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);const e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].traverseVisible(t)}traverseAncestors(t){const e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);const e=this.children;for(let n=0,i=e.length;n<i;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e){const n=this.parent;if(t===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),e===!0){const i=this.children;for(let r=0,o=i.length;r<o;r++)i[r].updateWorldMatrix(!1,!0)}}toJSON(t){const e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.6,type:"Object",generator:"Object3D.toJSON"});const i={};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.visibility=this._visibility,i.active=this._active,i.bounds=this._bounds.map(a=>({boxInitialized:a.boxInitialized,boxMin:a.box.min.toArray(),boxMax:a.box.max.toArray(),sphereInitialized:a.sphereInitialized,sphereRadius:a.sphere.radius,sphereCenter:a.sphere.center.toArray()})),i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.geometryCount=this._geometryCount,i.matricesTexture=this._matricesTexture.toJSON(t),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(i.boundingSphere={center:i.boundingSphere.center.toArray(),radius:i.boundingSphere.radius}),this.boundingBox!==null&&(i.boundingBox={min:i.boundingBox.min.toArray(),max:i.boundingBox.max.toArray()}));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=r(t.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const d=l[c];r(t.shapes,d)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(t.materials,this.material[l]));i.material=a}else i.material=r(t.materials,this.material);if(this.children.length>0){i.children=[];for(let a=0;a<this.children.length;a++)i.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){i.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];i.animations.push(r(t.animations,l))}}if(e){const a=o(t.geometries),l=o(t.materials),c=o(t.textures),h=o(t.images),d=o(t.shapes),u=o(t.skeletons),f=o(t.animations),g=o(t.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),d.length>0&&(n.shapes=d),u.length>0&&(n.skeletons=u),f.length>0&&(n.animations=f),g.length>0&&(n.nodes=g)}return n.object=i,n;function o(a){const l=[];for(const c in a){const h=a[c];delete h.metadata,l.push(h)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){const i=t.children[n];this.add(i.clone())}return this}}ve.DEFAULT_UP=new L(0,1,0);ve.DEFAULT_MATRIX_AUTO_UPDATE=!0;ve.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const mn=new L,Vn=new L,Bo=new L,Wn=new L,rs=new L,os=new L,bc=new L,Ho=new L,Go=new L,zo=new L,Vo=new ee,Wo=new ee,Xo=new ee;class xn{constructor(t=new L,e=new L,n=new L){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,i){i.subVectors(n,e),mn.subVectors(t,e),i.cross(mn);const r=i.lengthSq();return r>0?i.multiplyScalar(1/Math.sqrt(r)):i.set(0,0,0)}static getBarycoord(t,e,n,i,r){mn.subVectors(i,e),Vn.subVectors(n,e),Bo.subVectors(t,e);const o=mn.dot(mn),a=mn.dot(Vn),l=mn.dot(Bo),c=Vn.dot(Vn),h=Vn.dot(Bo),d=o*c-a*a;if(d===0)return r.set(0,0,0),null;const u=1/d,f=(c*l-a*h)*u,g=(o*h-a*l)*u;return r.set(1-f-g,g,f)}static containsPoint(t,e,n,i){return this.getBarycoord(t,e,n,i,Wn)===null?!1:Wn.x>=0&&Wn.y>=0&&Wn.x+Wn.y<=1}static getInterpolation(t,e,n,i,r,o,a,l){return this.getBarycoord(t,e,n,i,Wn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Wn.x),l.addScaledVector(o,Wn.y),l.addScaledVector(a,Wn.z),l)}static getInterpolatedAttribute(t,e,n,i,r,o){return Vo.setScalar(0),Wo.setScalar(0),Xo.setScalar(0),Vo.fromBufferAttribute(t,e),Wo.fromBufferAttribute(t,n),Xo.fromBufferAttribute(t,i),o.setScalar(0),o.addScaledVector(Vo,r.x),o.addScaledVector(Wo,r.y),o.addScaledVector(Xo,r.z),o}static isFrontFacing(t,e,n,i){return mn.subVectors(n,e),Vn.subVectors(t,e),mn.cross(Vn).dot(i)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,i){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[i]),this}setFromAttributeAndIndices(t,e,n,i){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,i),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return mn.subVectors(this.c,this.b),Vn.subVectors(this.a,this.b),mn.cross(Vn).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return xn.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return xn.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,i,r){return xn.getInterpolation(t,this.a,this.b,this.c,e,n,i,r)}containsPoint(t){return xn.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return xn.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){const n=this.a,i=this.b,r=this.c;let o,a;rs.subVectors(i,n),os.subVectors(r,n),Ho.subVectors(t,n);const l=rs.dot(Ho),c=os.dot(Ho);if(l<=0&&c<=0)return e.copy(n);Go.subVectors(t,i);const h=rs.dot(Go),d=os.dot(Go);if(h>=0&&d<=h)return e.copy(i);const u=l*d-h*c;if(u<=0&&l>=0&&h<=0)return o=l/(l-h),e.copy(n).addScaledVector(rs,o);zo.subVectors(t,r);const f=rs.dot(zo),g=os.dot(zo);if(g>=0&&f<=g)return e.copy(r);const _=f*c-l*g;if(_<=0&&c>=0&&g<=0)return a=c/(c-g),e.copy(n).addScaledVector(os,a);const m=h*g-f*d;if(m<=0&&d-h>=0&&f-g>=0)return bc.subVectors(r,i),a=(d-h)/(d-h+(f-g)),e.copy(i).addScaledVector(bc,a);const p=1/(m+_+u);return o=_*p,a=u*p,e.copy(n).addScaledVector(rs,o).addScaledVector(os,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}const vd={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},fi={h:0,s:0,l:0},Cr={h:0,s:0,l:0};function Yo(s,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?s+(t-s)*6*e:e<1/2?t:e<2/3?s+(t-s)*6*(2/3-e):s}class It{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){const i=t;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=be){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,qt.toWorkingColorSpace(this,e),this}setRGB(t,e,n,i=qt.workingColorSpace){return this.r=t,this.g=e,this.b=n,qt.toWorkingColorSpace(this,i),this}setHSL(t,e,n,i=qt.workingColorSpace){if(t=El(t,1),e=ke(e,0,1),n=ke(n,0,1),e===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+e):n+e-n*e,o=2*n-r;this.r=Yo(o,r,t+1/3),this.g=Yo(o,r,t),this.b=Yo(o,r,t-1/3)}return qt.toWorkingColorSpace(this,i),this}setStyle(t,e=be){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(t)){let r;const o=i[1],a=i[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(t)){const r=i[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(o===6)return this.setHex(parseInt(r,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=be){const n=vd[t.toLowerCase()];return n!==void 0?this.setHex(n,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Qn(t.r),this.g=Qn(t.g),this.b=Qn(t.b),this}copyLinearToSRGB(t){return this.r=ys(t.r),this.g=ys(t.g),this.b=ys(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=be){return qt.fromWorkingColorSpace(Ue.copy(this),t),Math.round(ke(Ue.r*255,0,255))*65536+Math.round(ke(Ue.g*255,0,255))*256+Math.round(ke(Ue.b*255,0,255))}getHexString(t=be){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=qt.workingColorSpace){qt.fromWorkingColorSpace(Ue.copy(this),e);const n=Ue.r,i=Ue.g,r=Ue.b,o=Math.max(n,i,r),a=Math.min(n,i,r);let l,c;const h=(a+o)/2;if(a===o)l=0,c=0;else{const d=o-a;switch(c=h<=.5?d/(o+a):d/(2-o-a),o){case n:l=(i-r)/d+(i<r?6:0);break;case i:l=(r-n)/d+2;break;case r:l=(n-i)/d+4;break}l/=6}return t.h=l,t.s=c,t.l=h,t}getRGB(t,e=qt.workingColorSpace){return qt.fromWorkingColorSpace(Ue.copy(this),e),t.r=Ue.r,t.g=Ue.g,t.b=Ue.b,t}getStyle(t=be){qt.fromWorkingColorSpace(Ue.copy(this),t);const e=Ue.r,n=Ue.g,i=Ue.b;return t!==be?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(t,e,n){return this.getHSL(fi),this.setHSL(fi.h+t,fi.s+e,fi.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(fi),t.getHSL(Cr);const n=rr(fi.h,Cr.h,e),i=rr(fi.s,Cr.s,e),r=rr(fi.l,Cr.l,e);return this.setHSL(n,i,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){const e=this.r,n=this.g,i=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*i,this.g=r[1]*e+r[4]*n+r[7]*i,this.b=r[2]*e+r[5]*n+r[8]*i,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Ue=new It;It.NAMES=vd;let hp=0;class Rn extends Ki{static get type(){return"Material"}get type(){return this.constructor.type}set type(t){}constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:hp++}),this.uuid=Mn(),this.name="",this.blending=vs,this.side=ti,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=_a,this.blendDst=va,this.blendEquation=Gi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new It(0,0,0),this.blendAlpha=0,this.depthFunc=As,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=ac,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Zi,this.stencilZFail=Zi,this.stencilZPass=Zi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(const e in t){const n=t[e];if(n===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}const i=this[e];if(i===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[e]=n}}toJSON(t){const e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});const n={metadata:{version:4.6,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==vs&&(n.blending=this.blending),this.side!==ti&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==_a&&(n.blendSrc=this.blendSrc),this.blendDst!==va&&(n.blendDst=this.blendDst),this.blendEquation!==Gi&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==As&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==ac&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Zi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Zi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Zi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(r){const o=[];for(const a in r){const l=r[a];delete l.metadata,o.push(l)}return o}if(e){const r=i(t.textures),o=i(t.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;const e=t.clippingPlanes;let n=null;if(e!==null){const i=e.length;n=new Array(i);for(let r=0;r!==i;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}onBuild(){console.warn("Material: onBuild() has been removed.")}}class bt extends Rn{static get type(){return"MeshBasicMaterial"}constructor(t){super(),this.isMeshBasicMaterial=!0,this.color=new It(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Pn,this.combine=Zh,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}const Ee=new L,Rr=new zt;class We{constructor(t,e,n=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=el,this.updateRanges=[],this.gpuType=yn,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let i=0,r=this.itemSize;i<r;i++)this.array[t+i]=e.array[n+i];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)Rr.fromBufferAttribute(this,e),Rr.applyMatrix3(t),this.setXY(e,Rr.x,Rr.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)Ee.fromBufferAttribute(this,e),Ee.applyMatrix3(t),this.setXYZ(e,Ee.x,Ee.y,Ee.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)Ee.fromBufferAttribute(this,e),Ee.applyMatrix4(t),this.setXYZ(e,Ee.x,Ee.y,Ee.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Ee.fromBufferAttribute(this,e),Ee.applyNormalMatrix(t),this.setXYZ(e,Ee.x,Ee.y,Ee.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Ee.fromBufferAttribute(this,e),Ee.transformDirection(t),this.setXYZ(e,Ee.x,Ee.y,Ee.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=vn(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=ae(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=vn(e,this.array)),e}setX(t,e){return this.normalized&&(e=ae(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=vn(e,this.array)),e}setY(t,e){return this.normalized&&(e=ae(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=vn(e,this.array)),e}setZ(t,e){return this.normalized&&(e=ae(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=vn(e,this.array)),e}setW(t,e){return this.normalized&&(e=ae(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=ae(e,this.array),n=ae(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,i){return t*=this.itemSize,this.normalized&&(e=ae(e,this.array),n=ae(n,this.array),i=ae(i,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=i,this}setXYZW(t,e,n,i,r){return t*=this.itemSize,this.normalized&&(e=ae(e,this.array),n=ae(n,this.array),i=ae(i,this.array),r=ae(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=i,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==el&&(t.usage=this.usage),t}}class xd extends We{constructor(t,e,n){super(new Uint16Array(t),e,n)}}class yd extends We{constructor(t,e,n){super(new Uint32Array(t),e,n)}}class xe extends We{constructor(t,e,n){super(new Float32Array(t),e,n)}}let dp=0;const sn=new kt,qo=new ve,as=new L,Je=new wn,Ys=new wn,Ie=new L;class qe extends Ki{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:dp++}),this.uuid=Mn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(md(t)?yd:xd)(t,1):this.index=t,this}setIndirect(t){return this.indirect=t,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){const e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Bt().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}const i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(t),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return sn.makeRotationFromQuaternion(t),this.applyMatrix4(sn),this}rotateX(t){return sn.makeRotationX(t),this.applyMatrix4(sn),this}rotateY(t){return sn.makeRotationY(t),this.applyMatrix4(sn),this}rotateZ(t){return sn.makeRotationZ(t),this.applyMatrix4(sn),this}translate(t,e,n){return sn.makeTranslation(t,e,n),this.applyMatrix4(sn),this}scale(t,e,n){return sn.makeScale(t,e,n),this.applyMatrix4(sn),this}lookAt(t){return qo.lookAt(t),qo.updateMatrix(),this.applyMatrix4(qo.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(as).negate(),this.translate(as.x,as.y,as.z),this}setFromPoints(t){const e=this.getAttribute("position");if(e===void 0){const n=[];for(let i=0,r=t.length;i<r;i++){const o=t[i];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new xe(n,3))}else{for(let n=0,i=e.count;n<i;n++){const r=t[n];e.setXYZ(n,r.x,r.y,r.z||0)}t.length>e.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new wn);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new L(-1/0,-1/0,-1/0),new L(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,i=e.length;n<i;n++){const r=e[n];Je.setFromBufferAttribute(r),this.morphTargetsRelative?(Ie.addVectors(this.boundingBox.min,Je.min),this.boundingBox.expandByPoint(Ie),Ie.addVectors(this.boundingBox.max,Je.max),this.boundingBox.expandByPoint(Ie)):(this.boundingBox.expandByPoint(Je.min),this.boundingBox.expandByPoint(Je.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Dn);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new L,1/0);return}if(t){const n=this.boundingSphere.center;if(Je.setFromBufferAttribute(t),e)for(let r=0,o=e.length;r<o;r++){const a=e[r];Ys.setFromBufferAttribute(a),this.morphTargetsRelative?(Ie.addVectors(Je.min,Ys.min),Je.expandByPoint(Ie),Ie.addVectors(Je.max,Ys.max),Je.expandByPoint(Ie)):(Je.expandByPoint(Ys.min),Je.expandByPoint(Ys.max))}Je.getCenter(n);let i=0;for(let r=0,o=t.count;r<o;r++)Ie.fromBufferAttribute(t,r),i=Math.max(i,n.distanceToSquared(Ie));if(e)for(let r=0,o=e.length;r<o;r++){const a=e[r],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)Ie.fromBufferAttribute(a,c),l&&(as.fromBufferAttribute(t,c),Ie.add(as)),i=Math.max(i,n.distanceToSquared(Ie))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=e.position,i=e.normal,r=e.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new We(new Float32Array(4*n.count),4));const o=this.getAttribute("tangent"),a=[],l=[];for(let C=0;C<n.count;C++)a[C]=new L,l[C]=new L;const c=new L,h=new L,d=new L,u=new zt,f=new zt,g=new zt,_=new L,m=new L;function p(C,S,x){c.fromBufferAttribute(n,C),h.fromBufferAttribute(n,S),d.fromBufferAttribute(n,x),u.fromBufferAttribute(r,C),f.fromBufferAttribute(r,S),g.fromBufferAttribute(r,x),h.sub(c),d.sub(c),f.sub(u),g.sub(u);const P=1/(f.x*g.y-g.x*f.y);isFinite(P)&&(_.copy(h).multiplyScalar(g.y).addScaledVector(d,-f.y).multiplyScalar(P),m.copy(d).multiplyScalar(f.x).addScaledVector(h,-g.x).multiplyScalar(P),a[C].add(_),a[S].add(_),a[x].add(_),l[C].add(m),l[S].add(m),l[x].add(m))}let y=this.groups;y.length===0&&(y=[{start:0,count:t.count}]);for(let C=0,S=y.length;C<S;++C){const x=y[C],P=x.start,F=x.count;for(let N=P,H=P+F;N<H;N+=3)p(t.getX(N+0),t.getX(N+1),t.getX(N+2))}const M=new L,v=new L,I=new L,T=new L;function E(C){I.fromBufferAttribute(i,C),T.copy(I);const S=a[C];M.copy(S),M.sub(I.multiplyScalar(I.dot(S))).normalize(),v.crossVectors(T,S);const P=v.dot(l[C])<0?-1:1;o.setXYZW(C,M.x,M.y,M.z,P)}for(let C=0,S=y.length;C<S;++C){const x=y[C],P=x.start,F=x.count;for(let N=P,H=P+F;N<H;N+=3)E(t.getX(N+0)),E(t.getX(N+1)),E(t.getX(N+2))}}computeVertexNormals(){const t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new We(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let u=0,f=n.count;u<f;u++)n.setXYZ(u,0,0,0);const i=new L,r=new L,o=new L,a=new L,l=new L,c=new L,h=new L,d=new L;if(t)for(let u=0,f=t.count;u<f;u+=3){const g=t.getX(u+0),_=t.getX(u+1),m=t.getX(u+2);i.fromBufferAttribute(e,g),r.fromBufferAttribute(e,_),o.fromBufferAttribute(e,m),h.subVectors(o,r),d.subVectors(i,r),h.cross(d),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,m),a.add(h),l.add(h),c.add(h),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let u=0,f=e.count;u<f;u+=3)i.fromBufferAttribute(e,u+0),r.fromBufferAttribute(e,u+1),o.fromBufferAttribute(e,u+2),h.subVectors(o,r),d.subVectors(i,r),h.cross(d),n.setXYZ(u+0,h.x,h.y,h.z),n.setXYZ(u+1,h.x,h.y,h.z),n.setXYZ(u+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)Ie.fromBufferAttribute(t,e),Ie.normalize(),t.setXYZ(e,Ie.x,Ie.y,Ie.z)}toNonIndexed(){function t(a,l){const c=a.array,h=a.itemSize,d=a.normalized,u=new c.constructor(l.length*h);let f=0,g=0;for(let _=0,m=l.length;_<m;_++){a.isInterleavedBufferAttribute?f=l[_]*a.data.stride+a.offset:f=l[_]*h;for(let p=0;p<h;p++)u[g++]=c[f++]}return new We(u,h,d)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const e=new qe,n=this.index.array,i=this.attributes;for(const a in i){const l=i[a],c=t(l,n);e.setAttribute(a,c)}const r=this.morphAttributes;for(const a in r){const l=[],c=r[a];for(let h=0,d=c.length;h<d;h++){const u=c[h],f=t(u,n);l.push(f)}e.morphAttributes[a]=l}e.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const c=o[a];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){const t={metadata:{version:4.6,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};const e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});const n=this.attributes;for(const l in n){const c=n[l];t.data.attributes[l]=c.toJSON(t.data)}const i={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let d=0,u=c.length;d<u;d++){const f=c[d];h.push(f.toJSON(t.data))}h.length>0&&(i[l]=h,r=!0)}r&&(t.data.morphAttributes=i,t.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(t.data.boundingSphere={center:a.center.toArray(),radius:a.radius}),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const e={};this.name=t.name;const n=t.index;n!==null&&this.setIndex(n.clone(e));const i=t.attributes;for(const c in i){const h=i[c];this.setAttribute(c,h.clone(e))}const r=t.morphAttributes;for(const c in r){const h=[],d=r[c];for(let u=0,f=d.length;u<f;u++)h.push(d[u].clone(e));this.morphAttributes[c]=h}this.morphTargetsRelative=t.morphTargetsRelative;const o=t.groups;for(let c=0,h=o.length;c<h;c++){const d=o[c];this.addGroup(d.start,d.count,d.materialIndex)}const a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Ec=new kt,Ni=new pr,Ir=new Dn,Ac=new L,Pr=new L,Lr=new L,Dr=new L,$o=new L,Nr=new L,Tc=new L,Ur=new L;class R extends ve{constructor(t=new qe,e=new bt){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const i=e[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){const a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(t,e){const n=this.geometry,i=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;e.fromBufferAttribute(i,t);const a=this.morphTargetInfluences;if(r&&a){Nr.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const h=a[l],d=r[l];h!==0&&($o.fromBufferAttribute(d,t),o?Nr.addScaledVector($o,h):Nr.addScaledVector($o.sub(e),h))}e.add(Nr)}return e}raycast(t,e){const n=this.geometry,i=this.material,r=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Ir.copy(n.boundingSphere),Ir.applyMatrix4(r),Ni.copy(t.ray).recast(t.near),!(Ir.containsPoint(Ni.origin)===!1&&(Ni.intersectSphere(Ir,Ac)===null||Ni.origin.distanceToSquared(Ac)>(t.far-t.near)**2))&&(Ec.copy(r).invert(),Ni.copy(t.ray).applyMatrix4(Ec),!(n.boundingBox!==null&&Ni.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,Ni)))}_computeIntersections(t,e,n){let i;const r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,d=r.attributes.normal,u=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,_=u.length;g<_;g++){const m=u[g],p=o[m.materialIndex],y=Math.max(m.start,f.start),M=Math.min(a.count,Math.min(m.start+m.count,f.start+f.count));for(let v=y,I=M;v<I;v+=3){const T=a.getX(v),E=a.getX(v+1),C=a.getX(v+2);i=kr(this,p,t,n,c,h,d,T,E,C),i&&(i.faceIndex=Math.floor(v/3),i.face.materialIndex=m.materialIndex,e.push(i))}}else{const g=Math.max(0,f.start),_=Math.min(a.count,f.start+f.count);for(let m=g,p=_;m<p;m+=3){const y=a.getX(m),M=a.getX(m+1),v=a.getX(m+2);i=kr(this,o,t,n,c,h,d,y,M,v),i&&(i.faceIndex=Math.floor(m/3),e.push(i))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,_=u.length;g<_;g++){const m=u[g],p=o[m.materialIndex],y=Math.max(m.start,f.start),M=Math.min(l.count,Math.min(m.start+m.count,f.start+f.count));for(let v=y,I=M;v<I;v+=3){const T=v,E=v+1,C=v+2;i=kr(this,p,t,n,c,h,d,T,E,C),i&&(i.faceIndex=Math.floor(v/3),i.face.materialIndex=m.materialIndex,e.push(i))}}else{const g=Math.max(0,f.start),_=Math.min(l.count,f.start+f.count);for(let m=g,p=_;m<p;m+=3){const y=m,M=m+1,v=m+2;i=kr(this,o,t,n,c,h,d,y,M,v),i&&(i.faceIndex=Math.floor(m/3),e.push(i))}}}}function up(s,t,e,n,i,r,o,a){let l;if(t.side===ze?l=n.intersectTriangle(o,r,i,!0,a):l=n.intersectTriangle(i,r,o,t.side===ti,a),l===null)return null;Ur.copy(a),Ur.applyMatrix4(s.matrixWorld);const c=e.ray.origin.distanceTo(Ur);return c<e.near||c>e.far?null:{distance:c,point:Ur.clone(),object:s}}function kr(s,t,e,n,i,r,o,a,l,c){s.getVertexPosition(a,Pr),s.getVertexPosition(l,Lr),s.getVertexPosition(c,Dr);const h=up(s,t,e,n,Pr,Lr,Dr,Tc);if(h){const d=new L;xn.getBarycoord(Tc,Pr,Lr,Dr,d),i&&(h.uv=xn.getInterpolatedAttribute(i,a,l,c,d,new zt)),r&&(h.uv1=xn.getInterpolatedAttribute(r,a,l,c,d,new zt)),o&&(h.normal=xn.getInterpolatedAttribute(o,a,l,c,d,new L),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const u={a,b:l,c,normal:new L,materialIndex:0};xn.getNormal(Pr,Lr,Dr,u.normal),h.face=u,h.barycoord=d}return h}class Q extends qe{constructor(t=1,e=1,n=1,i=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:i,heightSegments:r,depthSegments:o};const a=this;i=Math.floor(i),r=Math.floor(r),o=Math.floor(o);const l=[],c=[],h=[],d=[];let u=0,f=0;g("z","y","x",-1,-1,n,e,t,o,r,0),g("z","y","x",1,-1,n,e,-t,o,r,1),g("x","z","y",1,1,t,n,e,i,o,2),g("x","z","y",1,-1,t,n,-e,i,o,3),g("x","y","z",1,-1,t,e,n,i,r,4),g("x","y","z",-1,-1,t,e,-n,i,r,5),this.setIndex(l),this.setAttribute("position",new xe(c,3)),this.setAttribute("normal",new xe(h,3)),this.setAttribute("uv",new xe(d,2));function g(_,m,p,y,M,v,I,T,E,C,S){const x=v/E,P=I/C,F=v/2,N=I/2,H=T/2,z=E+1,V=C+1;let J=0,W=0;const rt=new L;for(let ft=0;ft<V;ft++){const At=ft*P-N;for(let Vt=0;Vt<z;Vt++){const de=Vt*x-F;rt[_]=de*y,rt[m]=At*M,rt[p]=H,c.push(rt.x,rt.y,rt.z),rt[_]=0,rt[m]=0,rt[p]=T>0?1:-1,h.push(rt.x,rt.y,rt.z),d.push(Vt/E),d.push(1-ft/C),J+=1}}for(let ft=0;ft<C;ft++)for(let At=0;At<E;At++){const Vt=u+At+z*ft,de=u+At+z*(ft+1),K=u+(At+1)+z*(ft+1),st=u+(At+1)+z*ft;l.push(Vt,de,st),l.push(de,K,st),W+=6}a.addGroup(f,W,S),f+=W,u+=J}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Q(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}function Ls(s){const t={};for(const e in s){t[e]={};for(const n in s[e]){const i=s[e][n];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=i.clone():Array.isArray(i)?t[e][n]=i.slice():t[e][n]=i}}return t}function Be(s){const t={};for(let e=0;e<s.length;e++){const n=Ls(s[e]);for(const i in n)t[i]=n[i]}return t}function fp(s){const t=[];for(let e=0;e<s.length;e++)t.push(s[e].clone());return t}function Md(s){const t=s.getRenderTarget();return t===null?s.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:qt.workingColorSpace}const pp={clone:Ls,merge:Be};var mp=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,gp=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Ii extends Rn{static get type(){return"ShaderMaterial"}constructor(t){super(),this.isShaderMaterial=!0,this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=mp,this.fragmentShader=gp,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Ls(t.uniforms),this.uniformsGroups=fp(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){const e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(const i in this.uniforms){const o=this.uniforms[i].value;o&&o.isTexture?e.uniforms[i]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?e.uniforms[i]={type:"c",value:o.getHex()}:o&&o.isVector2?e.uniforms[i]={type:"v2",value:o.toArray()}:o&&o.isVector3?e.uniforms[i]={type:"v3",value:o.toArray()}:o&&o.isVector4?e.uniforms[i]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?e.uniforms[i]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?e.uniforms[i]={type:"m4",value:o.toArray()}:e.uniforms[i]={value:o}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;const n={};for(const i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}}class Sd extends ve{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new kt,this.projectionMatrix=new kt,this.projectionMatrixInverse=new kt,this.coordinateSystem=Zn}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const pi=new L,Cc=new zt,Rc=new zt;class Ke extends Sd{constructor(t=50,e=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){const e=.5*this.getFilmHeight()/t;this.fov=Ps*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){const t=Math.tan(sr*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Ps*2*Math.atan(Math.tan(sr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){pi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(pi.x,pi.y).multiplyScalar(-t/pi.z),pi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(pi.x,pi.y).multiplyScalar(-t/pi.z)}getViewSize(t,e){return this.getViewBounds(t,Cc,Rc),e.subVectors(Rc,Cc)}setViewOffset(t,e,n,i,r,o){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=this.near;let e=t*Math.tan(sr*.5*this.fov)/this.zoom,n=2*e,i=this.aspect*n,r=-.5*i;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*i/l,e-=o.offsetY*n/c,i*=o.width/l,n*=o.height/c}const a=this.filmOffset;a!==0&&(r+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+i,e,e-n,t,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}}const ls=-90,cs=1;class _p extends ve{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const i=new Ke(ls,cs,t,e);i.layers=this.layers,this.add(i);const r=new Ke(ls,cs,t,e);r.layers=this.layers,this.add(r);const o=new Ke(ls,cs,t,e);o.layers=this.layers,this.add(o);const a=new Ke(ls,cs,t,e);a.layers=this.layers,this.add(a);const l=new Ke(ls,cs,t,e);l.layers=this.layers,this.add(l);const c=new Ke(ls,cs,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const t=this.coordinateSystem,e=this.children.concat(),[n,i,r,o,a,l]=e;for(const c of e)this.remove(c);if(t===Zn)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===oo)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(const c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());const[r,o,a,l,c,h]=this.children,d=t.getRenderTarget(),u=t.getActiveCubeFace(),f=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;const _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,t.setRenderTarget(n,0,i),t.render(e,r),t.setRenderTarget(n,1,i),t.render(e,o),t.setRenderTarget(n,2,i),t.render(e,a),t.setRenderTarget(n,3,i),t.render(e,l),t.setRenderTarget(n,4,i),t.render(e,c),n.texture.generateMipmaps=_,t.setRenderTarget(n,5,i),t.render(e,h),t.setRenderTarget(d,u,f),t.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class wd extends Te{constructor(t,e,n,i,r,o,a,l,c,h){t=t!==void 0?t:[],e=e!==void 0?e:Ts,super(t,e,n,i,r,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class vp extends $i{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;const n={width:t,height:t,depth:1},i=[n,n,n,n,n,n];this.texture=new wd(i,e.mapping,e.wrapS,e.wrapT,e.magFilter,e.minFilter,e.format,e.type,e.anisotropy,e.colorSpace),this.texture.isRenderTargetTexture=!0,this.texture.generateMipmaps=e.generateMipmaps!==void 0?e.generateMipmaps:!1,this.texture.minFilter=e.minFilter!==void 0?e.minFilter:Qe}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},i=new Q(5,5,5),r=new Ii({name:"CubemapFromEquirect",uniforms:Ls(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:ze,blending:Ai});r.uniforms.tEquirect.value=e;const o=new R(i,r),a=e.minFilter;return e.minFilter===jn&&(e.minFilter=Qe),new _p(1,10,this).update(t,o),e.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,e,n,i){const r=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(e,n,i);t.setRenderTarget(r)}}const Ko=new L,xp=new L,yp=new Bt;class Bi{constructor(t=new L(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,i){return this.normal.set(t,e,n),this.constant=i,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){const i=Ko.subVectors(n,e).cross(xp.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(i,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){const t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){const n=t.delta(Ko),i=this.normal.dot(n);if(i===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;const r=-(t.start.dot(this.normal)+this.constant)/i;return r<0||r>1?null:e.copy(t.start).addScaledVector(n,r)}intersectsLine(t){const e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){const n=e||yp.getNormalMatrix(t),i=this.coplanarPoint(Ko).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Ui=new Dn,Fr=new L;class Tl{constructor(t=new Bi,e=new Bi,n=new Bi,i=new Bi,r=new Bi,o=new Bi){this.planes=[t,e,n,i,r,o]}set(t,e,n,i,r,o){const a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(n),a[3].copy(i),a[4].copy(r),a[5].copy(o),this}copy(t){const e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=Zn){const n=this.planes,i=t.elements,r=i[0],o=i[1],a=i[2],l=i[3],c=i[4],h=i[5],d=i[6],u=i[7],f=i[8],g=i[9],_=i[10],m=i[11],p=i[12],y=i[13],M=i[14],v=i[15];if(n[0].setComponents(l-r,u-c,m-f,v-p).normalize(),n[1].setComponents(l+r,u+c,m+f,v+p).normalize(),n[2].setComponents(l+o,u+h,m+g,v+y).normalize(),n[3].setComponents(l-o,u-h,m-g,v-y).normalize(),n[4].setComponents(l-a,u-d,m-_,v-M).normalize(),e===Zn)n[5].setComponents(l+a,u+d,m+_,v+M).normalize();else if(e===oo)n[5].setComponents(a,d,_,M).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),Ui.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{const e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),Ui.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(Ui)}intersectsSprite(t){return Ui.center.set(0,0,0),Ui.radius=.7071067811865476,Ui.applyMatrix4(t.matrixWorld),this.intersectsSphere(Ui)}intersectsSphere(t){const e=this.planes,n=t.center,i=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<i)return!1;return!0}intersectsBox(t){const e=this.planes;for(let n=0;n<6;n++){const i=e[n];if(Fr.x=i.normal.x>0?t.max.x:t.min.x,Fr.y=i.normal.y>0?t.max.y:t.min.y,Fr.z=i.normal.z>0?t.max.z:t.min.z,i.distanceToPoint(Fr)<0)return!1}return!0}containsPoint(t){const e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}function bd(){let s=null,t=!1,e=null,n=null;function i(r,o){e(r,o),n=s.requestAnimationFrame(i)}return{start:function(){t!==!0&&e!==null&&(n=s.requestAnimationFrame(i),t=!0)},stop:function(){s.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){s=r}}}function Mp(s){const t=new WeakMap;function e(a,l){const c=a.array,h=a.usage,d=c.byteLength,u=s.createBuffer();s.bindBuffer(l,u),s.bufferData(l,c,h),a.onUploadCallback();let f;if(c instanceof Float32Array)f=s.FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?f=s.HALF_FLOAT:f=s.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=s.SHORT;else if(c instanceof Uint32Array)f=s.UNSIGNED_INT;else if(c instanceof Int32Array)f=s.INT;else if(c instanceof Int8Array)f=s.BYTE;else if(c instanceof Uint8Array)f=s.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:u,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:d}}function n(a,l,c){const h=l.array,d=l.updateRanges;if(s.bindBuffer(c,a),d.length===0)s.bufferSubData(c,0,h);else{d.sort((f,g)=>f.start-g.start);let u=0;for(let f=1;f<d.length;f++){const g=d[u],_=d[f];_.start<=g.start+g.count+1?g.count=Math.max(g.count,_.start+_.count-g.start):(++u,d[u]=_)}d.length=u+1;for(let f=0,g=d.length;f<g;f++){const _=d[f];s.bufferSubData(c,_.start*h.BYTES_PER_ELEMENT,h,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function i(a){return a.isInterleavedBufferAttribute&&(a=a.data),t.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);const l=t.get(a);l&&(s.deleteBuffer(l.buffer),t.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const h=t.get(a);(!h||h.version<a.version)&&t.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const c=t.get(a);if(c===void 0)t.set(a,e(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:i,remove:r,update:o}}class Xe extends qe{constructor(t=1,e=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:i};const r=t/2,o=e/2,a=Math.floor(n),l=Math.floor(i),c=a+1,h=l+1,d=t/a,u=e/l,f=[],g=[],_=[],m=[];for(let p=0;p<h;p++){const y=p*u-o;for(let M=0;M<c;M++){const v=M*d-r;g.push(v,-y,0),_.push(0,0,1),m.push(M/a),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let y=0;y<a;y++){const M=y+c*p,v=y+c*(p+1),I=y+1+c*(p+1),T=y+1+c*p;f.push(M,v,T),f.push(v,I,T)}this.setIndex(f),this.setAttribute("position",new xe(g,3)),this.setAttribute("normal",new xe(_,3)),this.setAttribute("uv",new xe(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Xe(t.width,t.height,t.widthSegments,t.heightSegments)}}var Sp=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,wp=`#ifdef USE_ALPHAHASH
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
#endif`,bp=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Ep=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Ap=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Tp=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Cp=`#ifdef USE_AOMAP
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
#endif`,Rp=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Ip=`#ifdef USE_BATCHING
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
#endif`,Pp=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Lp=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Dp=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Np=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,Up=`#ifdef USE_IRIDESCENCE
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
#endif`,kp=`#ifdef USE_BUMPMAP
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
#endif`,Fp=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Op=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Bp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,Hp=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Gp=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,zp=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Vp=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Wp=`#if defined( USE_COLOR_ALPHA )
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
#endif`,Xp=`#define PI 3.141592653589793
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
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
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
} // validated`,Yp=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,qp=`vec3 transformedNormal = objectNormal;
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
#endif`,$p=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Kp=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,jp=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Zp=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Jp="gl_FragColor = linearToOutputTexel( gl_FragColor );",Qp=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,tm=`#ifdef USE_ENVMAP
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
#endif`,em=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,nm=`#ifdef USE_ENVMAP
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
#endif`,im=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,sm=`#ifdef USE_ENVMAP
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
#endif`,rm=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,om=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,am=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,lm=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,cm=`#ifdef USE_GRADIENTMAP
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
}`,hm=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,dm=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,um=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,fm=`uniform bool receiveShadow;
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
#endif`,pm=`#ifdef USE_ENVMAP
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
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
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
#endif`,mm=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,gm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,_m=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,vm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,xm=`PhysicalMaterial material;
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
#endif`,ym=`struct PhysicalMaterial {
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
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
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
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
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
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
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
}`,Mm=`
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
#endif`,Sm=`#if defined( RE_IndirectDiffuse )
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
#endif`,wm=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,bm=`#if defined( USE_LOGDEPTHBUF )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Em=`#if defined( USE_LOGDEPTHBUF )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Am=`#ifdef USE_LOGDEPTHBUF
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Tm=`#ifdef USE_LOGDEPTHBUF
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Cm=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Rm=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Im=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Pm=`#if defined( USE_POINTS_UV )
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
#endif`,Lm=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Dm=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Nm=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Um=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,km=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Fm=`#ifdef USE_MORPHTARGETS
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
#endif`,Om=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Bm=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Hm=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Gm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,zm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Vm=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Wm=`#ifdef USE_NORMALMAP
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
#endif`,Xm=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Ym=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,qm=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,$m=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Km=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,jm=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,Zm=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Jm=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Qm=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,tg=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,eg=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,ng=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,ig=`#if NUM_SPOT_LIGHT_COORDS > 0
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
		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		float hard_shadow = step( compare , distribution.x );
		if (hard_shadow != 1.0 ) {
			float distance = compare - distribution.x ;
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
#endif`,sg=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,rg=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,og=`float getShadowMask() {
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
}`,ag=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,lg=`#ifdef USE_SKINNING
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
#endif`,cg=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,hg=`#ifdef USE_SKINNING
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
#endif`,dg=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,ug=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,fg=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,pg=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,mg=`#ifdef USE_TRANSMISSION
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
#endif`,gg=`#ifdef USE_TRANSMISSION
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
#endif`,_g=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,vg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,xg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,yg=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Mg=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Sg=`uniform sampler2D t2D;
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
}`,wg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,bg=`#ifdef ENVMAP_TYPE_CUBE
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
}`,Eg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Ag=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Tg=`#include <common>
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
}`,Cg=`#if DEPTH_PACKING == 3200
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
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,Rg=`#define DISTANCE
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
}`,Ig=`#define DISTANCE
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
}`,Pg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Lg=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Dg=`uniform float scale;
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
}`,Ng=`uniform vec3 diffuse;
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
}`,Ug=`#include <common>
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
}`,kg=`uniform vec3 diffuse;
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
}`,Fg=`#define LAMBERT
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
}`,Og=`#define LAMBERT
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
}`,Bg=`#define MATCAP
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
}`,Hg=`#define MATCAP
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
}`,Gg=`#define NORMAL
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
}`,zg=`#define NORMAL
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
}`,Vg=`#define PHONG
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
}`,Wg=`#define PHONG
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
}`,Xg=`#define STANDARD
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
}`,Yg=`#define STANDARD
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
}`,qg=`#define TOON
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
}`,$g=`#define TOON
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
}`,Kg=`uniform float size;
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
}`,jg=`uniform vec3 diffuse;
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
}`,Zg=`#include <common>
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
}`,Jg=`uniform vec3 color;
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
}`,Qg=`uniform float rotation;
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
}`,t0=`uniform vec3 diffuse;
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
}`,Gt={alphahash_fragment:Sp,alphahash_pars_fragment:wp,alphamap_fragment:bp,alphamap_pars_fragment:Ep,alphatest_fragment:Ap,alphatest_pars_fragment:Tp,aomap_fragment:Cp,aomap_pars_fragment:Rp,batching_pars_vertex:Ip,batching_vertex:Pp,begin_vertex:Lp,beginnormal_vertex:Dp,bsdfs:Np,iridescence_fragment:Up,bumpmap_pars_fragment:kp,clipping_planes_fragment:Fp,clipping_planes_pars_fragment:Op,clipping_planes_pars_vertex:Bp,clipping_planes_vertex:Hp,color_fragment:Gp,color_pars_fragment:zp,color_pars_vertex:Vp,color_vertex:Wp,common:Xp,cube_uv_reflection_fragment:Yp,defaultnormal_vertex:qp,displacementmap_pars_vertex:$p,displacementmap_vertex:Kp,emissivemap_fragment:jp,emissivemap_pars_fragment:Zp,colorspace_fragment:Jp,colorspace_pars_fragment:Qp,envmap_fragment:tm,envmap_common_pars_fragment:em,envmap_pars_fragment:nm,envmap_pars_vertex:im,envmap_physical_pars_fragment:pm,envmap_vertex:sm,fog_vertex:rm,fog_pars_vertex:om,fog_fragment:am,fog_pars_fragment:lm,gradientmap_pars_fragment:cm,lightmap_pars_fragment:hm,lights_lambert_fragment:dm,lights_lambert_pars_fragment:um,lights_pars_begin:fm,lights_toon_fragment:mm,lights_toon_pars_fragment:gm,lights_phong_fragment:_m,lights_phong_pars_fragment:vm,lights_physical_fragment:xm,lights_physical_pars_fragment:ym,lights_fragment_begin:Mm,lights_fragment_maps:Sm,lights_fragment_end:wm,logdepthbuf_fragment:bm,logdepthbuf_pars_fragment:Em,logdepthbuf_pars_vertex:Am,logdepthbuf_vertex:Tm,map_fragment:Cm,map_pars_fragment:Rm,map_particle_fragment:Im,map_particle_pars_fragment:Pm,metalnessmap_fragment:Lm,metalnessmap_pars_fragment:Dm,morphinstance_vertex:Nm,morphcolor_vertex:Um,morphnormal_vertex:km,morphtarget_pars_vertex:Fm,morphtarget_vertex:Om,normal_fragment_begin:Bm,normal_fragment_maps:Hm,normal_pars_fragment:Gm,normal_pars_vertex:zm,normal_vertex:Vm,normalmap_pars_fragment:Wm,clearcoat_normal_fragment_begin:Xm,clearcoat_normal_fragment_maps:Ym,clearcoat_pars_fragment:qm,iridescence_pars_fragment:$m,opaque_fragment:Km,packing:jm,premultiplied_alpha_fragment:Zm,project_vertex:Jm,dithering_fragment:Qm,dithering_pars_fragment:tg,roughnessmap_fragment:eg,roughnessmap_pars_fragment:ng,shadowmap_pars_fragment:ig,shadowmap_pars_vertex:sg,shadowmap_vertex:rg,shadowmask_pars_fragment:og,skinbase_vertex:ag,skinning_pars_vertex:lg,skinning_vertex:cg,skinnormal_vertex:hg,specularmap_fragment:dg,specularmap_pars_fragment:ug,tonemapping_fragment:fg,tonemapping_pars_fragment:pg,transmission_fragment:mg,transmission_pars_fragment:gg,uv_pars_fragment:_g,uv_pars_vertex:vg,uv_vertex:xg,worldpos_vertex:yg,background_vert:Mg,background_frag:Sg,backgroundCube_vert:wg,backgroundCube_frag:bg,cube_vert:Eg,cube_frag:Ag,depth_vert:Tg,depth_frag:Cg,distanceRGBA_vert:Rg,distanceRGBA_frag:Ig,equirect_vert:Pg,equirect_frag:Lg,linedashed_vert:Dg,linedashed_frag:Ng,meshbasic_vert:Ug,meshbasic_frag:kg,meshlambert_vert:Fg,meshlambert_frag:Og,meshmatcap_vert:Bg,meshmatcap_frag:Hg,meshnormal_vert:Gg,meshnormal_frag:zg,meshphong_vert:Vg,meshphong_frag:Wg,meshphysical_vert:Xg,meshphysical_frag:Yg,meshtoon_vert:qg,meshtoon_frag:$g,points_vert:Kg,points_frag:jg,shadow_vert:Zg,shadow_frag:Jg,sprite_vert:Qg,sprite_frag:t0},ot={common:{diffuse:{value:new It(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Bt},alphaMap:{value:null},alphaMapTransform:{value:new Bt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Bt}},envmap:{envMap:{value:null},envMapRotation:{value:new Bt},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Bt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Bt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Bt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Bt},normalScale:{value:new zt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Bt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Bt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Bt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Bt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new It(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new It(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Bt},alphaTest:{value:0},uvTransform:{value:new Bt}},sprite:{diffuse:{value:new It(16777215)},opacity:{value:1},center:{value:new zt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Bt},alphaMap:{value:null},alphaMapTransform:{value:new Bt},alphaTest:{value:0}}},Tn={basic:{uniforms:Be([ot.common,ot.specularmap,ot.envmap,ot.aomap,ot.lightmap,ot.fog]),vertexShader:Gt.meshbasic_vert,fragmentShader:Gt.meshbasic_frag},lambert:{uniforms:Be([ot.common,ot.specularmap,ot.envmap,ot.aomap,ot.lightmap,ot.emissivemap,ot.bumpmap,ot.normalmap,ot.displacementmap,ot.fog,ot.lights,{emissive:{value:new It(0)}}]),vertexShader:Gt.meshlambert_vert,fragmentShader:Gt.meshlambert_frag},phong:{uniforms:Be([ot.common,ot.specularmap,ot.envmap,ot.aomap,ot.lightmap,ot.emissivemap,ot.bumpmap,ot.normalmap,ot.displacementmap,ot.fog,ot.lights,{emissive:{value:new It(0)},specular:{value:new It(1118481)},shininess:{value:30}}]),vertexShader:Gt.meshphong_vert,fragmentShader:Gt.meshphong_frag},standard:{uniforms:Be([ot.common,ot.envmap,ot.aomap,ot.lightmap,ot.emissivemap,ot.bumpmap,ot.normalmap,ot.displacementmap,ot.roughnessmap,ot.metalnessmap,ot.fog,ot.lights,{emissive:{value:new It(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Gt.meshphysical_vert,fragmentShader:Gt.meshphysical_frag},toon:{uniforms:Be([ot.common,ot.aomap,ot.lightmap,ot.emissivemap,ot.bumpmap,ot.normalmap,ot.displacementmap,ot.gradientmap,ot.fog,ot.lights,{emissive:{value:new It(0)}}]),vertexShader:Gt.meshtoon_vert,fragmentShader:Gt.meshtoon_frag},matcap:{uniforms:Be([ot.common,ot.bumpmap,ot.normalmap,ot.displacementmap,ot.fog,{matcap:{value:null}}]),vertexShader:Gt.meshmatcap_vert,fragmentShader:Gt.meshmatcap_frag},points:{uniforms:Be([ot.points,ot.fog]),vertexShader:Gt.points_vert,fragmentShader:Gt.points_frag},dashed:{uniforms:Be([ot.common,ot.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Gt.linedashed_vert,fragmentShader:Gt.linedashed_frag},depth:{uniforms:Be([ot.common,ot.displacementmap]),vertexShader:Gt.depth_vert,fragmentShader:Gt.depth_frag},normal:{uniforms:Be([ot.common,ot.bumpmap,ot.normalmap,ot.displacementmap,{opacity:{value:1}}]),vertexShader:Gt.meshnormal_vert,fragmentShader:Gt.meshnormal_frag},sprite:{uniforms:Be([ot.sprite,ot.fog]),vertexShader:Gt.sprite_vert,fragmentShader:Gt.sprite_frag},background:{uniforms:{uvTransform:{value:new Bt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Gt.background_vert,fragmentShader:Gt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Bt}},vertexShader:Gt.backgroundCube_vert,fragmentShader:Gt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Gt.cube_vert,fragmentShader:Gt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Gt.equirect_vert,fragmentShader:Gt.equirect_frag},distanceRGBA:{uniforms:Be([ot.common,ot.displacementmap,{referencePosition:{value:new L},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Gt.distanceRGBA_vert,fragmentShader:Gt.distanceRGBA_frag},shadow:{uniforms:Be([ot.lights,ot.fog,{color:{value:new It(0)},opacity:{value:1}}]),vertexShader:Gt.shadow_vert,fragmentShader:Gt.shadow_frag}};Tn.physical={uniforms:Be([Tn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Bt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Bt},clearcoatNormalScale:{value:new zt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Bt},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Bt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Bt},sheen:{value:0},sheenColor:{value:new It(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Bt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Bt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Bt},transmissionSamplerSize:{value:new zt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Bt},attenuationDistance:{value:0},attenuationColor:{value:new It(0)},specularColor:{value:new It(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Bt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Bt},anisotropyVector:{value:new zt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Bt}}]),vertexShader:Gt.meshphysical_vert,fragmentShader:Gt.meshphysical_frag};const Or={r:0,b:0,g:0},ki=new Pn,e0=new kt;function n0(s,t,e,n,i,r,o){const a=new It(0);let l=r===!0?0:1,c,h,d=null,u=0,f=null;function g(y){let M=y.isScene===!0?y.background:null;return M&&M.isTexture&&(M=(y.backgroundBlurriness>0?e:t).get(M)),M}function _(y){let M=!1;const v=g(y);v===null?p(a,l):v&&v.isColor&&(p(v,1),M=!0);const I=s.xr.getEnvironmentBlendMode();I==="additive"?n.buffers.color.setClear(0,0,0,1,o):I==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(s.autoClear||M)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function m(y,M){const v=g(M);v&&(v.isCubeTexture||v.mapping===yo)?(h===void 0&&(h=new R(new Q(1,1,1),new Ii({name:"BackgroundCubeMaterial",uniforms:Ls(Tn.backgroundCube.uniforms),vertexShader:Tn.backgroundCube.vertexShader,fragmentShader:Tn.backgroundCube.fragmentShader,side:ze,depthTest:!1,depthWrite:!1,fog:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(I,T,E){this.matrixWorld.copyPosition(E.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(h)),ki.copy(M.backgroundRotation),ki.x*=-1,ki.y*=-1,ki.z*=-1,v.isCubeTexture&&v.isRenderTargetTexture===!1&&(ki.y*=-1,ki.z*=-1),h.material.uniforms.envMap.value=v,h.material.uniforms.flipEnvMap.value=v.isCubeTexture&&v.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=M.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(e0.makeRotationFromEuler(ki)),h.material.toneMapped=qt.getTransfer(v.colorSpace)!==ce,(d!==v||u!==v.version||f!==s.toneMapping)&&(h.material.needsUpdate=!0,d=v,u=v.version,f=s.toneMapping),h.layers.enableAll(),y.unshift(h,h.geometry,h.material,0,0,null)):v&&v.isTexture&&(c===void 0&&(c=new R(new Xe(2,2),new Ii({name:"BackgroundMaterial",uniforms:Ls(Tn.background.uniforms),vertexShader:Tn.background.vertexShader,fragmentShader:Tn.background.fragmentShader,side:ti,depthTest:!1,depthWrite:!1,fog:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(c)),c.material.uniforms.t2D.value=v,c.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,c.material.toneMapped=qt.getTransfer(v.colorSpace)!==ce,v.matrixAutoUpdate===!0&&v.updateMatrix(),c.material.uniforms.uvTransform.value.copy(v.matrix),(d!==v||u!==v.version||f!==s.toneMapping)&&(c.material.needsUpdate=!0,d=v,u=v.version,f=s.toneMapping),c.layers.enableAll(),y.unshift(c,c.geometry,c.material,0,0,null))}function p(y,M){y.getRGB(Or,Md(s)),n.buffers.color.setClear(Or.r,Or.g,Or.b,M,o)}return{getClearColor:function(){return a},setClearColor:function(y,M=1){a.set(y),l=M,p(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(y){l=y,p(a,l)},render:_,addToRenderList:m}}function i0(s,t){const e=s.getParameter(s.MAX_VERTEX_ATTRIBS),n={},i=u(null);let r=i,o=!1;function a(x,P,F,N,H){let z=!1;const V=d(N,F,P);r!==V&&(r=V,c(r.object)),z=f(x,N,F,H),z&&g(x,N,F,H),H!==null&&t.update(H,s.ELEMENT_ARRAY_BUFFER),(z||o)&&(o=!1,v(x,P,F,N),H!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,t.get(H).buffer))}function l(){return s.createVertexArray()}function c(x){return s.bindVertexArray(x)}function h(x){return s.deleteVertexArray(x)}function d(x,P,F){const N=F.wireframe===!0;let H=n[x.id];H===void 0&&(H={},n[x.id]=H);let z=H[P.id];z===void 0&&(z={},H[P.id]=z);let V=z[N];return V===void 0&&(V=u(l()),z[N]=V),V}function u(x){const P=[],F=[],N=[];for(let H=0;H<e;H++)P[H]=0,F[H]=0,N[H]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:P,enabledAttributes:F,attributeDivisors:N,object:x,attributes:{},index:null}}function f(x,P,F,N){const H=r.attributes,z=P.attributes;let V=0;const J=F.getAttributes();for(const W in J)if(J[W].location>=0){const ft=H[W];let At=z[W];if(At===void 0&&(W==="instanceMatrix"&&x.instanceMatrix&&(At=x.instanceMatrix),W==="instanceColor"&&x.instanceColor&&(At=x.instanceColor)),ft===void 0||ft.attribute!==At||At&&ft.data!==At.data)return!0;V++}return r.attributesNum!==V||r.index!==N}function g(x,P,F,N){const H={},z=P.attributes;let V=0;const J=F.getAttributes();for(const W in J)if(J[W].location>=0){let ft=z[W];ft===void 0&&(W==="instanceMatrix"&&x.instanceMatrix&&(ft=x.instanceMatrix),W==="instanceColor"&&x.instanceColor&&(ft=x.instanceColor));const At={};At.attribute=ft,ft&&ft.data&&(At.data=ft.data),H[W]=At,V++}r.attributes=H,r.attributesNum=V,r.index=N}function _(){const x=r.newAttributes;for(let P=0,F=x.length;P<F;P++)x[P]=0}function m(x){p(x,0)}function p(x,P){const F=r.newAttributes,N=r.enabledAttributes,H=r.attributeDivisors;F[x]=1,N[x]===0&&(s.enableVertexAttribArray(x),N[x]=1),H[x]!==P&&(s.vertexAttribDivisor(x,P),H[x]=P)}function y(){const x=r.newAttributes,P=r.enabledAttributes;for(let F=0,N=P.length;F<N;F++)P[F]!==x[F]&&(s.disableVertexAttribArray(F),P[F]=0)}function M(x,P,F,N,H,z,V){V===!0?s.vertexAttribIPointer(x,P,F,H,z):s.vertexAttribPointer(x,P,F,N,H,z)}function v(x,P,F,N){_();const H=N.attributes,z=F.getAttributes(),V=P.defaultAttributeValues;for(const J in z){const W=z[J];if(W.location>=0){let rt=H[J];if(rt===void 0&&(J==="instanceMatrix"&&x.instanceMatrix&&(rt=x.instanceMatrix),J==="instanceColor"&&x.instanceColor&&(rt=x.instanceColor)),rt!==void 0){const ft=rt.normalized,At=rt.itemSize,Vt=t.get(rt);if(Vt===void 0)continue;const de=Vt.buffer,K=Vt.type,st=Vt.bytesPerElement,Mt=K===s.INT||K===s.UNSIGNED_INT||rt.gpuType===_l;if(rt.isInterleavedBufferAttribute){const lt=rt.data,Lt=lt.stride,Ut=rt.offset;if(lt.isInstancedInterleavedBuffer){for(let Wt=0;Wt<W.locationSize;Wt++)p(W.location+Wt,lt.meshPerAttribute);x.isInstancedMesh!==!0&&N._maxInstanceCount===void 0&&(N._maxInstanceCount=lt.meshPerAttribute*lt.count)}else for(let Wt=0;Wt<W.locationSize;Wt++)m(W.location+Wt);s.bindBuffer(s.ARRAY_BUFFER,de);for(let Wt=0;Wt<W.locationSize;Wt++)M(W.location+Wt,At/W.locationSize,K,ft,Lt*st,(Ut+At/W.locationSize*Wt)*st,Mt)}else{if(rt.isInstancedBufferAttribute){for(let lt=0;lt<W.locationSize;lt++)p(W.location+lt,rt.meshPerAttribute);x.isInstancedMesh!==!0&&N._maxInstanceCount===void 0&&(N._maxInstanceCount=rt.meshPerAttribute*rt.count)}else for(let lt=0;lt<W.locationSize;lt++)m(W.location+lt);s.bindBuffer(s.ARRAY_BUFFER,de);for(let lt=0;lt<W.locationSize;lt++)M(W.location+lt,At/W.locationSize,K,ft,At*st,At/W.locationSize*lt*st,Mt)}}else if(V!==void 0){const ft=V[J];if(ft!==void 0)switch(ft.length){case 2:s.vertexAttrib2fv(W.location,ft);break;case 3:s.vertexAttrib3fv(W.location,ft);break;case 4:s.vertexAttrib4fv(W.location,ft);break;default:s.vertexAttrib1fv(W.location,ft)}}}}y()}function I(){C();for(const x in n){const P=n[x];for(const F in P){const N=P[F];for(const H in N)h(N[H].object),delete N[H];delete P[F]}delete n[x]}}function T(x){if(n[x.id]===void 0)return;const P=n[x.id];for(const F in P){const N=P[F];for(const H in N)h(N[H].object),delete N[H];delete P[F]}delete n[x.id]}function E(x){for(const P in n){const F=n[P];if(F[x.id]===void 0)continue;const N=F[x.id];for(const H in N)h(N[H].object),delete N[H];delete F[x.id]}}function C(){S(),o=!0,r!==i&&(r=i,c(r.object))}function S(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:a,reset:C,resetDefaultState:S,dispose:I,releaseStatesOfGeometry:T,releaseStatesOfProgram:E,initAttributes:_,enableAttribute:m,disableUnusedAttributes:y}}function s0(s,t,e){let n;function i(c){n=c}function r(c,h){s.drawArrays(n,c,h),e.update(h,n,1)}function o(c,h,d){d!==0&&(s.drawArraysInstanced(n,c,h,d),e.update(h,n,d))}function a(c,h,d){if(d===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,h,0,d);let f=0;for(let g=0;g<d;g++)f+=h[g];e.update(f,n,1)}function l(c,h,d,u){if(d===0)return;const f=t.get("WEBGL_multi_draw");if(f===null)for(let g=0;g<c.length;g++)o(c[g],h[g],u[g]);else{f.multiDrawArraysInstancedWEBGL(n,c,0,h,0,u,0,d);let g=0;for(let _=0;_<d;_++)g+=h[_]*u[_];e.update(g,n,1)}}this.setMode=i,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function r0(s,t,e,n){let i;function r(){if(i!==void 0)return i;if(t.has("EXT_texture_filter_anisotropic")===!0){const E=t.get("EXT_texture_filter_anisotropic");i=s.getParameter(E.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(E){return!(E!==cn&&n.convert(E)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(E){const C=E===fr&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(E!==ei&&n.convert(E)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE)&&E!==yn&&!C)}function l(E){if(E==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";E="mediump"}return E==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp";const h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);const d=e.logarithmicDepthBuffer===!0,u=e.reverseDepthBuffer===!0&&t.has("EXT_clip_control"),f=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),g=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=s.getParameter(s.MAX_TEXTURE_SIZE),m=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),p=s.getParameter(s.MAX_VERTEX_ATTRIBS),y=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),M=s.getParameter(s.MAX_VARYING_VECTORS),v=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),I=g>0,T=s.getParameter(s.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:d,reverseDepthBuffer:u,maxTextures:f,maxVertexTextures:g,maxTextureSize:_,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:y,maxVaryings:M,maxFragmentUniforms:v,vertexTextures:I,maxSamples:T}}function o0(s){const t=this;let e=null,n=0,i=!1,r=!1;const o=new Bi,a=new Bt,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,u){const f=d.length!==0||u||n!==0||i;return i=u,n=d.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(d,u){e=h(d,u,0)},this.setState=function(d,u,f){const g=d.clippingPlanes,_=d.clipIntersection,m=d.clipShadows,p=s.get(d);if(!i||g===null||g.length===0||r&&!m)r?h(null):c();else{const y=r?0:n,M=y*4;let v=p.clippingState||null;l.value=v,v=h(g,u,M,f);for(let I=0;I!==M;++I)v[I]=e[I];p.clippingState=v,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=y}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function h(d,u,f,g){const _=d!==null?d.length:0;let m=null;if(_!==0){if(m=l.value,g!==!0||m===null){const p=f+_*4,y=u.matrixWorldInverse;a.getNormalMatrix(y),(m===null||m.length<p)&&(m=new Float32Array(p));for(let M=0,v=f;M!==_;++M,v+=4)o.copy(d[M]).applyMatrix4(y,a),o.normal.toArray(m,v),m[v+3]=o.constant}l.value=m,l.needsUpdate=!0}return t.numPlanes=_,t.numIntersection=0,m}}function a0(s){let t=new WeakMap;function e(o,a){return a===Aa?o.mapping=Ts:a===Ta&&(o.mapping=Cs),o}function n(o){if(o&&o.isTexture){const a=o.mapping;if(a===Aa||a===Ta)if(t.has(o)){const l=t.get(o).texture;return e(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const c=new vp(l.height);return c.fromEquirectangularTexture(s,o),t.set(o,c),o.addEventListener("dispose",i),e(c.texture,o.mapping)}else return null}}return o}function i(o){const a=o.target;a.removeEventListener("dispose",i);const l=t.get(a);l!==void 0&&(t.delete(a),l.dispose())}function r(){t=new WeakMap}return{get:n,dispose:r}}class So extends Sd{constructor(t=-1,e=1,n=1,i=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=i,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,i,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2;let r=n-t,o=n+t,a=i+e,l=i-e;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}}const _s=4,Ic=[.125,.215,.35,.446,.526,.582],zi=20,jo=new So,Pc=new It;let Zo=null,Jo=0,Qo=0,ta=!1;const Hi=(1+Math.sqrt(5))/2,hs=1/Hi,Lc=[new L(-Hi,hs,0),new L(Hi,hs,0),new L(-hs,0,Hi),new L(hs,0,Hi),new L(0,Hi,-hs),new L(0,Hi,hs),new L(-1,1,-1),new L(1,1,-1),new L(-1,1,1),new L(1,1,1)];class Dc{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,n=.1,i=100){Zo=this._renderer.getRenderTarget(),Jo=this._renderer.getActiveCubeFace(),Qo=this._renderer.getActiveMipmapLevel(),ta=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(256);const r=this._allocateTargets();return r.depthBuffer=!0,this._sceneToCubeUV(t,n,i,r),e>0&&this._blur(r,0,0,e),this._applyPMREM(r),this._cleanup(r),r}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=kc(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Uc(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(Zo,Jo,Qo),this._renderer.xr.enabled=ta,t.scissorTest=!1,Br(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===Ts||t.mapping===Cs?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),Zo=this._renderer.getRenderTarget(),Jo=this._renderer.getActiveCubeFace(),Qo=this._renderer.getActiveMipmapLevel(),ta=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:Qe,minFilter:Qe,generateMipmaps:!1,type:fr,format:cn,colorSpace:Ye,depthBuffer:!1},i=Nc(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Nc(t,e,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=l0(r)),this._blurMaterial=c0(r,t,e)}return i}_compileMaterial(t){const e=new R(this._lodPlanes[0],t);this._renderer.compile(e,jo)}_sceneToCubeUV(t,e,n,i){const a=new Ke(90,1,e,n),l=[1,-1,1,1,1,1],c=[1,1,1,-1,-1,-1],h=this._renderer,d=h.autoClear,u=h.toneMapping;h.getClearColor(Pc),h.toneMapping=Ti,h.autoClear=!1;const f=new bt({name:"PMREM.Background",side:ze,depthWrite:!1,depthTest:!1}),g=new R(new Q,f);let _=!1;const m=t.background;m?m.isColor&&(f.color.copy(m),t.background=null,_=!0):(f.color.copy(Pc),_=!0);for(let p=0;p<6;p++){const y=p%3;y===0?(a.up.set(0,l[p],0),a.lookAt(c[p],0,0)):y===1?(a.up.set(0,0,l[p]),a.lookAt(0,c[p],0)):(a.up.set(0,l[p],0),a.lookAt(0,0,c[p]));const M=this._cubeSize;Br(i,y*M,p>2?M:0,M,M),h.setRenderTarget(i),_&&h.render(g,a),h.render(t,a)}g.geometry.dispose(),g.material.dispose(),h.toneMapping=u,h.autoClear=d,t.background=m}_textureToCubeUV(t,e){const n=this._renderer,i=t.mapping===Ts||t.mapping===Cs;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=kc()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Uc());const r=i?this._cubemapMaterial:this._equirectMaterial,o=new R(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=t;const l=this._cubeSize;Br(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(o,jo)}_applyPMREM(t){const e=this._renderer,n=e.autoClear;e.autoClear=!1;const i=this._lodPlanes.length;for(let r=1;r<i;r++){const o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=Lc[(i-r-1)%Lc.length];this._blur(t,r-1,r,o,a)}e.autoClear=n}_blur(t,e,n,i,r){const o=this._pingPongRenderTarget;this._halfBlur(t,o,e,n,i,"latitudinal",r),this._halfBlur(o,t,n,n,i,"longitudinal",r)}_halfBlur(t,e,n,i,r,o,a){const l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,d=new R(this._lodPlanes[i],c),u=c.uniforms,f=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*zi-1),_=r/g,m=isFinite(r)?1+Math.floor(h*_):zi;m>zi&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${zi}`);const p=[];let y=0;for(let E=0;E<zi;++E){const C=E/_,S=Math.exp(-C*C/2);p.push(S),E===0?y+=S:E<m&&(y+=2*S)}for(let E=0;E<p.length;E++)p[E]=p[E]/y;u.envMap.value=t.texture,u.samples.value=m,u.weights.value=p,u.latitudinal.value=o==="latitudinal",a&&(u.poleAxis.value=a);const{_lodMax:M}=this;u.dTheta.value=g,u.mipInt.value=M-n;const v=this._sizeLods[i],I=3*v*(i>M-_s?i-M+_s:0),T=4*(this._cubeSize-v);Br(e,I,T,3*v,2*v),l.setRenderTarget(e),l.render(d,jo)}}function l0(s){const t=[],e=[],n=[];let i=s;const r=s-_s+1+Ic.length;for(let o=0;o<r;o++){const a=Math.pow(2,i);e.push(a);let l=1/a;o>s-_s?l=Ic[o-s+_s-1]:o===0&&(l=0),n.push(l);const c=1/(a-2),h=-c,d=1+c,u=[h,h,d,h,d,d,h,h,d,d,h,d],f=6,g=6,_=3,m=2,p=1,y=new Float32Array(_*g*f),M=new Float32Array(m*g*f),v=new Float32Array(p*g*f);for(let T=0;T<f;T++){const E=T%3*2/3-1,C=T>2?0:-1,S=[E,C,0,E+2/3,C,0,E+2/3,C+1,0,E,C,0,E+2/3,C+1,0,E,C+1,0];y.set(S,_*g*T),M.set(u,m*g*T);const x=[T,T,T,T,T,T];v.set(x,p*g*T)}const I=new qe;I.setAttribute("position",new We(y,_)),I.setAttribute("uv",new We(M,m)),I.setAttribute("faceIndex",new We(v,p)),t.push(I),i>_s&&i--}return{lodPlanes:t,sizeLods:e,sigmas:n}}function Nc(s,t,e){const n=new $i(s,t,e);return n.texture.mapping=yo,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Br(s,t,e,n,i){s.viewport.set(t,e,n,i),s.scissor.set(t,e,n,i)}function c0(s,t,e){const n=new Float32Array(zi),i=new L(0,1,0);return new Ii({name:"SphericalGaussianBlur",defines:{n:zi,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:Cl(),fragmentShader:`

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
		`,blending:Ai,depthTest:!1,depthWrite:!1})}function Uc(){return new Ii({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Cl(),fragmentShader:`

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
		`,blending:Ai,depthTest:!1,depthWrite:!1})}function kc(){return new Ii({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Cl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Ai,depthTest:!1,depthWrite:!1})}function Cl(){return`

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
	`}function h0(s){let t=new WeakMap,e=null;function n(a){if(a&&a.isTexture){const l=a.mapping,c=l===Aa||l===Ta,h=l===Ts||l===Cs;if(c||h){let d=t.get(a);const u=d!==void 0?d.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==u)return e===null&&(e=new Dc(s)),d=c?e.fromEquirectangular(a,d):e.fromCubemap(a,d),d.texture.pmremVersion=a.pmremVersion,t.set(a,d),d.texture;if(d!==void 0)return d.texture;{const f=a.image;return c&&f&&f.height>0||h&&f&&i(f)?(e===null&&(e=new Dc(s)),d=c?e.fromEquirectangular(a):e.fromCubemap(a),d.texture.pmremVersion=a.pmremVersion,t.set(a,d),a.addEventListener("dispose",r),d.texture):null}}}return a}function i(a){let l=0;const c=6;for(let h=0;h<c;h++)a[h]!==void 0&&l++;return l===c}function r(a){const l=a.target;l.removeEventListener("dispose",r);const c=t.get(l);c!==void 0&&(t.delete(l),c.dispose())}function o(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:n,dispose:o}}function d0(s){const t={};function e(n){if(t[n]!==void 0)return t[n];let i;switch(n){case"WEBGL_depth_texture":i=s.getExtension("WEBGL_depth_texture")||s.getExtension("MOZ_WEBGL_depth_texture")||s.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":i=s.getExtension("EXT_texture_filter_anisotropic")||s.getExtension("MOZ_EXT_texture_filter_anisotropic")||s.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":i=s.getExtension("WEBGL_compressed_texture_s3tc")||s.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":i=s.getExtension("WEBGL_compressed_texture_pvrtc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:i=s.getExtension(n)}return t[n]=i,i}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){const i=e(n);return i===null&&nr("THREE.WebGLRenderer: "+n+" extension not supported."),i}}}function u0(s,t,e,n){const i={},r=new WeakMap;function o(d){const u=d.target;u.index!==null&&t.remove(u.index);for(const g in u.attributes)t.remove(u.attributes[g]);for(const g in u.morphAttributes){const _=u.morphAttributes[g];for(let m=0,p=_.length;m<p;m++)t.remove(_[m])}u.removeEventListener("dispose",o),delete i[u.id];const f=r.get(u);f&&(t.remove(f),r.delete(u)),n.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,e.memory.geometries--}function a(d,u){return i[u.id]===!0||(u.addEventListener("dispose",o),i[u.id]=!0,e.memory.geometries++),u}function l(d){const u=d.attributes;for(const g in u)t.update(u[g],s.ARRAY_BUFFER);const f=d.morphAttributes;for(const g in f){const _=f[g];for(let m=0,p=_.length;m<p;m++)t.update(_[m],s.ARRAY_BUFFER)}}function c(d){const u=[],f=d.index,g=d.attributes.position;let _=0;if(f!==null){const y=f.array;_=f.version;for(let M=0,v=y.length;M<v;M+=3){const I=y[M+0],T=y[M+1],E=y[M+2];u.push(I,T,T,E,E,I)}}else if(g!==void 0){const y=g.array;_=g.version;for(let M=0,v=y.length/3-1;M<v;M+=3){const I=M+0,T=M+1,E=M+2;u.push(I,T,T,E,E,I)}}else return;const m=new(md(u)?yd:xd)(u,1);m.version=_;const p=r.get(d);p&&t.remove(p),r.set(d,m)}function h(d){const u=r.get(d);if(u){const f=d.index;f!==null&&u.version<f.version&&c(d)}else c(d);return r.get(d)}return{get:a,update:l,getWireframeAttribute:h}}function f0(s,t,e){let n;function i(u){n=u}let r,o;function a(u){r=u.type,o=u.bytesPerElement}function l(u,f){s.drawElements(n,f,r,u*o),e.update(f,n,1)}function c(u,f,g){g!==0&&(s.drawElementsInstanced(n,f,r,u*o,g),e.update(f,n,g))}function h(u,f,g){if(g===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,f,0,r,u,0,g);let m=0;for(let p=0;p<g;p++)m+=f[p];e.update(m,n,1)}function d(u,f,g,_){if(g===0)return;const m=t.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<u.length;p++)c(u[p]/o,f[p],_[p]);else{m.multiDrawElementsInstancedWEBGL(n,f,0,r,u,0,_,0,g);let p=0;for(let y=0;y<g;y++)p+=f[y]*_[y];e.update(p,n,1)}}this.setMode=i,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=d}function p0(s){const t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(e.calls++,o){case s.TRIANGLES:e.triangles+=a*(r/3);break;case s.LINES:e.lines+=a*(r/2);break;case s.LINE_STRIP:e.lines+=a*(r-1);break;case s.LINE_LOOP:e.lines+=a*r;break;case s.POINTS:e.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function i(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:i,update:n}}function m0(s,t,e){const n=new WeakMap,i=new ee;function r(o,a,l){const c=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,d=h!==void 0?h.length:0;let u=n.get(a);if(u===void 0||u.count!==d){let x=function(){C.dispose(),n.delete(a),a.removeEventListener("dispose",x)};var f=x;u!==void 0&&u.texture.dispose();const g=a.morphAttributes.position!==void 0,_=a.morphAttributes.normal!==void 0,m=a.morphAttributes.color!==void 0,p=a.morphAttributes.position||[],y=a.morphAttributes.normal||[],M=a.morphAttributes.color||[];let v=0;g===!0&&(v=1),_===!0&&(v=2),m===!0&&(v=3);let I=a.attributes.position.count*v,T=1;I>t.maxTextureSize&&(T=Math.ceil(I/t.maxTextureSize),I=t.maxTextureSize);const E=new Float32Array(I*T*4*d),C=new _d(E,I,T,d);C.type=yn,C.needsUpdate=!0;const S=v*4;for(let P=0;P<d;P++){const F=p[P],N=y[P],H=M[P],z=I*T*4*P;for(let V=0;V<F.count;V++){const J=V*S;g===!0&&(i.fromBufferAttribute(F,V),E[z+J+0]=i.x,E[z+J+1]=i.y,E[z+J+2]=i.z,E[z+J+3]=0),_===!0&&(i.fromBufferAttribute(N,V),E[z+J+4]=i.x,E[z+J+5]=i.y,E[z+J+6]=i.z,E[z+J+7]=0),m===!0&&(i.fromBufferAttribute(H,V),E[z+J+8]=i.x,E[z+J+9]=i.y,E[z+J+10]=i.z,E[z+J+11]=H.itemSize===4?i.w:1)}}u={count:d,texture:C,size:new zt(I,T)},n.set(a,u),a.addEventListener("dispose",x)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(s,"morphTexture",o.morphTexture,e);else{let g=0;for(let m=0;m<c.length;m++)g+=c[m];const _=a.morphTargetsRelative?1:1-g;l.getUniforms().setValue(s,"morphTargetBaseInfluence",_),l.getUniforms().setValue(s,"morphTargetInfluences",c)}l.getUniforms().setValue(s,"morphTargetsTexture",u.texture,e),l.getUniforms().setValue(s,"morphTargetsTextureSize",u.size)}return{update:r}}function g0(s,t,e,n){let i=new WeakMap;function r(l){const c=n.render.frame,h=l.geometry,d=t.get(l,h);if(i.get(d)!==c&&(t.update(d),i.set(d,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),i.get(l)!==c&&(e.update(l.instanceMatrix,s.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,s.ARRAY_BUFFER),i.set(l,c))),l.isSkinnedMesh){const u=l.skeleton;i.get(u)!==c&&(u.update(),i.set(u,c))}return d}function o(){i=new WeakMap}function a(l){const c=l.target;c.removeEventListener("dispose",a),e.remove(c.instanceMatrix),c.instanceColor!==null&&e.remove(c.instanceColor)}return{update:r,dispose:o}}class Ed extends Te{constructor(t,e,n,i,r,o,a,l,c,h=xs){if(h!==xs&&h!==Is)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");n===void 0&&h===xs&&(n=qi),n===void 0&&h===Is&&(n=Rs),super(null,i,r,o,a,l,h,n,c),this.isDepthTexture=!0,this.image={width:t,height:e},this.magFilter=a!==void 0?a:Ve,this.minFilter=l!==void 0?l:Ve,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.compareFunction=t.compareFunction,this}toJSON(t){const e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}}const Ad=new Te,Fc=new Ed(1,1),Td=new _d,Cd=new np,Rd=new wd,Oc=[],Bc=[],Hc=new Float32Array(16),Gc=new Float32Array(9),zc=new Float32Array(4);function Fs(s,t,e){const n=s[0];if(n<=0||n>0)return s;const i=t*e;let r=Oc[i];if(r===void 0&&(r=new Float32Array(i),Oc[i]=r),t!==0){n.toArray(r,0);for(let o=1,a=0;o!==t;++o)a+=e,s[o].toArray(r,a)}return r}function Ce(s,t){if(s.length!==t.length)return!1;for(let e=0,n=s.length;e<n;e++)if(s[e]!==t[e])return!1;return!0}function Re(s,t){for(let e=0,n=t.length;e<n;e++)s[e]=t[e]}function wo(s,t){let e=Bc[t];e===void 0&&(e=new Int32Array(t),Bc[t]=e);for(let n=0;n!==t;++n)e[n]=s.allocateTextureUnit();return e}function _0(s,t){const e=this.cache;e[0]!==t&&(s.uniform1f(this.addr,t),e[0]=t)}function v0(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ce(e,t))return;s.uniform2fv(this.addr,t),Re(e,t)}}function x0(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(s.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Ce(e,t))return;s.uniform3fv(this.addr,t),Re(e,t)}}function y0(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ce(e,t))return;s.uniform4fv(this.addr,t),Re(e,t)}}function M0(s,t){const e=this.cache,n=t.elements;if(n===void 0){if(Ce(e,t))return;s.uniformMatrix2fv(this.addr,!1,t),Re(e,t)}else{if(Ce(e,n))return;zc.set(n),s.uniformMatrix2fv(this.addr,!1,zc),Re(e,n)}}function S0(s,t){const e=this.cache,n=t.elements;if(n===void 0){if(Ce(e,t))return;s.uniformMatrix3fv(this.addr,!1,t),Re(e,t)}else{if(Ce(e,n))return;Gc.set(n),s.uniformMatrix3fv(this.addr,!1,Gc),Re(e,n)}}function w0(s,t){const e=this.cache,n=t.elements;if(n===void 0){if(Ce(e,t))return;s.uniformMatrix4fv(this.addr,!1,t),Re(e,t)}else{if(Ce(e,n))return;Hc.set(n),s.uniformMatrix4fv(this.addr,!1,Hc),Re(e,n)}}function b0(s,t){const e=this.cache;e[0]!==t&&(s.uniform1i(this.addr,t),e[0]=t)}function E0(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ce(e,t))return;s.uniform2iv(this.addr,t),Re(e,t)}}function A0(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ce(e,t))return;s.uniform3iv(this.addr,t),Re(e,t)}}function T0(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ce(e,t))return;s.uniform4iv(this.addr,t),Re(e,t)}}function C0(s,t){const e=this.cache;e[0]!==t&&(s.uniform1ui(this.addr,t),e[0]=t)}function R0(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(s.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Ce(e,t))return;s.uniform2uiv(this.addr,t),Re(e,t)}}function I0(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(s.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Ce(e,t))return;s.uniform3uiv(this.addr,t),Re(e,t)}}function P0(s,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(s.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Ce(e,t))return;s.uniform4uiv(this.addr,t),Re(e,t)}}function L0(s,t,e){const n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i);let r;this.type===s.SAMPLER_2D_SHADOW?(Fc.compareFunction=pd,r=Fc):r=Ad,e.setTexture2D(t||r,i)}function D0(s,t,e){const n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),e.setTexture3D(t||Cd,i)}function N0(s,t,e){const n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),e.setTextureCube(t||Rd,i)}function U0(s,t,e){const n=this.cache,i=e.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),e.setTexture2DArray(t||Td,i)}function k0(s){switch(s){case 5126:return _0;case 35664:return v0;case 35665:return x0;case 35666:return y0;case 35674:return M0;case 35675:return S0;case 35676:return w0;case 5124:case 35670:return b0;case 35667:case 35671:return E0;case 35668:case 35672:return A0;case 35669:case 35673:return T0;case 5125:return C0;case 36294:return R0;case 36295:return I0;case 36296:return P0;case 35678:case 36198:case 36298:case 36306:case 35682:return L0;case 35679:case 36299:case 36307:return D0;case 35680:case 36300:case 36308:case 36293:return N0;case 36289:case 36303:case 36311:case 36292:return U0}}function F0(s,t){s.uniform1fv(this.addr,t)}function O0(s,t){const e=Fs(t,this.size,2);s.uniform2fv(this.addr,e)}function B0(s,t){const e=Fs(t,this.size,3);s.uniform3fv(this.addr,e)}function H0(s,t){const e=Fs(t,this.size,4);s.uniform4fv(this.addr,e)}function G0(s,t){const e=Fs(t,this.size,4);s.uniformMatrix2fv(this.addr,!1,e)}function z0(s,t){const e=Fs(t,this.size,9);s.uniformMatrix3fv(this.addr,!1,e)}function V0(s,t){const e=Fs(t,this.size,16);s.uniformMatrix4fv(this.addr,!1,e)}function W0(s,t){s.uniform1iv(this.addr,t)}function X0(s,t){s.uniform2iv(this.addr,t)}function Y0(s,t){s.uniform3iv(this.addr,t)}function q0(s,t){s.uniform4iv(this.addr,t)}function $0(s,t){s.uniform1uiv(this.addr,t)}function K0(s,t){s.uniform2uiv(this.addr,t)}function j0(s,t){s.uniform3uiv(this.addr,t)}function Z0(s,t){s.uniform4uiv(this.addr,t)}function J0(s,t,e){const n=this.cache,i=t.length,r=wo(e,i);Ce(n,r)||(s.uniform1iv(this.addr,r),Re(n,r));for(let o=0;o!==i;++o)e.setTexture2D(t[o]||Ad,r[o])}function Q0(s,t,e){const n=this.cache,i=t.length,r=wo(e,i);Ce(n,r)||(s.uniform1iv(this.addr,r),Re(n,r));for(let o=0;o!==i;++o)e.setTexture3D(t[o]||Cd,r[o])}function t_(s,t,e){const n=this.cache,i=t.length,r=wo(e,i);Ce(n,r)||(s.uniform1iv(this.addr,r),Re(n,r));for(let o=0;o!==i;++o)e.setTextureCube(t[o]||Rd,r[o])}function e_(s,t,e){const n=this.cache,i=t.length,r=wo(e,i);Ce(n,r)||(s.uniform1iv(this.addr,r),Re(n,r));for(let o=0;o!==i;++o)e.setTexture2DArray(t[o]||Td,r[o])}function n_(s){switch(s){case 5126:return F0;case 35664:return O0;case 35665:return B0;case 35666:return H0;case 35674:return G0;case 35675:return z0;case 35676:return V0;case 5124:case 35670:return W0;case 35667:case 35671:return X0;case 35668:case 35672:return Y0;case 35669:case 35673:return q0;case 5125:return $0;case 36294:return K0;case 36295:return j0;case 36296:return Z0;case 35678:case 36198:case 36298:case 36306:case 35682:return J0;case 35679:case 36299:case 36307:return Q0;case 35680:case 36300:case 36308:case 36293:return t_;case 36289:case 36303:case 36311:case 36292:return e_}}class i_{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=k0(e.type)}}class s_{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=n_(e.type)}}class r_{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){const i=this.seq;for(let r=0,o=i.length;r!==o;++r){const a=i[r];a.setValue(t,e[a.id],n)}}}const ea=/(\w+)(\])?(\[|\.)?/g;function Vc(s,t){s.seq.push(t),s.map[t.id]=t}function o_(s,t,e){const n=s.name,i=n.length;for(ea.lastIndex=0;;){const r=ea.exec(n),o=ea.lastIndex;let a=r[1];const l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===i){Vc(e,c===void 0?new i_(a,s,t):new s_(a,s,t));break}else{let d=e.map[a];d===void 0&&(d=new r_(a),Vc(e,d)),e=d}}}class no{constructor(t,e){this.seq=[],this.map={};const n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let i=0;i<n;++i){const r=t.getActiveUniform(e,i),o=t.getUniformLocation(e,r.name);o_(r,o,this)}}setValue(t,e,n,i){const r=this.map[e];r!==void 0&&r.setValue(t,n,i)}setOptional(t,e,n){const i=e[n];i!==void 0&&this.setValue(t,n,i)}static upload(t,e,n,i){for(let r=0,o=e.length;r!==o;++r){const a=e[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(t,l.value,i)}}static seqWithValue(t,e){const n=[];for(let i=0,r=t.length;i!==r;++i){const o=t[i];o.id in e&&n.push(o)}return n}}function Wc(s,t,e){const n=s.createShader(t);return s.shaderSource(n,e),s.compileShader(n),n}const a_=37297;let l_=0;function c_(s,t){const e=s.split(`
`),n=[],i=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let o=i;o<r;o++){const a=o+1;n.push(`${a===t?">":" "} ${a}: ${e[o]}`)}return n.join(`
`)}const Xc=new Bt;function h_(s){qt._getMatrix(Xc,qt.workingColorSpace,s);const t=`mat3( ${Xc.elements.map(e=>e.toFixed(4))} )`;switch(qt.getTransfer(s)){case Mo:return[t,"LinearTransferOETF"];case ce:return[t,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",s),[t,"LinearTransferOETF"]}}function Yc(s,t,e){const n=s.getShaderParameter(t,s.COMPILE_STATUS),i=s.getShaderInfoLog(t).trim();if(n&&i==="")return"";const r=/ERROR: 0:(\d+)/.exec(i);if(r){const o=parseInt(r[1]);return e.toUpperCase()+`

`+i+`

`+c_(s.getShaderSource(t),o)}else return i}function d_(s,t){const e=h_(t);return[`vec4 ${s}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}function u_(s,t){let e;switch(t){case df:e="Linear";break;case uf:e="Reinhard";break;case ff:e="Cineon";break;case Jh:e="ACESFilmic";break;case mf:e="AgX";break;case gf:e="Neutral";break;case pf:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+s+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}const Hr=new L;function f_(){qt.getLuminanceCoefficients(Hr);const s=Hr.x.toFixed(4),t=Hr.y.toFixed(4),e=Hr.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function p_(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(ir).join(`
`)}function m_(s){const t=[];for(const e in s){const n=s[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function g_(s,t){const e={},n=s.getProgramParameter(t,s.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){const r=s.getActiveAttrib(t,i),o=r.name;let a=1;r.type===s.FLOAT_MAT2&&(a=2),r.type===s.FLOAT_MAT3&&(a=3),r.type===s.FLOAT_MAT4&&(a=4),e[o]={type:r.type,location:s.getAttribLocation(t,o),locationSize:a}}return e}function ir(s){return s!==""}function qc(s,t){const e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return s.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function $c(s,t){return s.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const __=/^[ \t]*#include +<([\w\d./]+)>/gm;function nl(s){return s.replace(__,x_)}const v_=new Map;function x_(s,t){let e=Gt[t];if(e===void 0){const n=v_.get(t);if(n!==void 0)e=Gt[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("Can not resolve #include <"+t+">")}return nl(e)}const y_=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Kc(s){return s.replace(y_,M_)}function M_(s,t,e,n){let i="";for(let r=parseInt(t);r<parseInt(e);r++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return i}function jc(s){let t=`precision ${s.precision} float;
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
	`;return s.precision==="highp"?t+=`
#define HIGH_PRECISION`:s.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:s.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}function S_(s){let t="SHADOWMAP_TYPE_BASIC";return s.shadowMapType===Kh?t="SHADOWMAP_TYPE_PCF":s.shadowMapType===jh?t="SHADOWMAP_TYPE_PCF_SOFT":s.shadowMapType===Yn&&(t="SHADOWMAP_TYPE_VSM"),t}function w_(s){let t="ENVMAP_TYPE_CUBE";if(s.envMap)switch(s.envMapMode){case Ts:case Cs:t="ENVMAP_TYPE_CUBE";break;case yo:t="ENVMAP_TYPE_CUBE_UV";break}return t}function b_(s){let t="ENVMAP_MODE_REFLECTION";if(s.envMap)switch(s.envMapMode){case Cs:t="ENVMAP_MODE_REFRACTION";break}return t}function E_(s){let t="ENVMAP_BLENDING_NONE";if(s.envMap)switch(s.combine){case Zh:t="ENVMAP_BLENDING_MULTIPLY";break;case cf:t="ENVMAP_BLENDING_MIX";break;case hf:t="ENVMAP_BLENDING_ADD";break}return t}function A_(s){const t=s.envMapCubeUVHeight;if(t===null)return null;const e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:n,maxMip:e}}function T_(s,t,e,n){const i=s.getContext(),r=e.defines;let o=e.vertexShader,a=e.fragmentShader;const l=S_(e),c=w_(e),h=b_(e),d=E_(e),u=A_(e),f=p_(e),g=m_(r),_=i.createProgram();let m,p,y=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(ir).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(ir).join(`
`),p.length>0&&(p+=`
`)):(m=[jc(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(ir).join(`
`),p=[jc(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+h:"",e.envMap?"#define "+d:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor||e.batchingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGDEPTHBUF":"",e.reverseDepthBuffer?"#define USE_REVERSEDEPTHBUF":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Ti?"#define TONE_MAPPING":"",e.toneMapping!==Ti?Gt.tonemapping_pars_fragment:"",e.toneMapping!==Ti?u_("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",Gt.colorspace_pars_fragment,d_("linearToOutputTexel",e.outputColorSpace),f_(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(ir).join(`
`)),o=nl(o),o=qc(o,e),o=$c(o,e),a=nl(a),a=qc(a,e),a=$c(a,e),o=Kc(o),a=Kc(a),e.isRawShaderMaterial!==!0&&(y=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",e.glslVersion===lc?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===lc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const M=y+m+o,v=y+p+a,I=Wc(i,i.VERTEX_SHADER,M),T=Wc(i,i.FRAGMENT_SHADER,v);i.attachShader(_,I),i.attachShader(_,T),e.index0AttributeName!==void 0?i.bindAttribLocation(_,0,e.index0AttributeName):e.morphTargets===!0&&i.bindAttribLocation(_,0,"position"),i.linkProgram(_);function E(P){if(s.debug.checkShaderErrors){const F=i.getProgramInfoLog(_).trim(),N=i.getShaderInfoLog(I).trim(),H=i.getShaderInfoLog(T).trim();let z=!0,V=!0;if(i.getProgramParameter(_,i.LINK_STATUS)===!1)if(z=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(i,_,I,T);else{const J=Yc(i,I,"vertex"),W=Yc(i,T,"fragment");console.error("THREE.WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(_,i.VALIDATE_STATUS)+`

Material Name: `+P.name+`
Material Type: `+P.type+`

Program Info Log: `+F+`
`+J+`
`+W)}else F!==""?console.warn("THREE.WebGLProgram: Program Info Log:",F):(N===""||H==="")&&(V=!1);V&&(P.diagnostics={runnable:z,programLog:F,vertexShader:{log:N,prefix:m},fragmentShader:{log:H,prefix:p}})}i.deleteShader(I),i.deleteShader(T),C=new no(i,_),S=g_(i,_)}let C;this.getUniforms=function(){return C===void 0&&E(this),C};let S;this.getAttributes=function(){return S===void 0&&E(this),S};let x=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return x===!1&&(x=i.getProgramParameter(_,a_)),x},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(_),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=l_++,this.cacheKey=t,this.usedTimes=1,this.program=_,this.vertexShader=I,this.fragmentShader=T,this}let C_=0;class R_{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){const e=t.vertexShader,n=t.fragmentShader,i=this._getShaderStage(e),r=this._getShaderStage(n),o=this._getShaderCacheForMaterial(t);return o.has(i)===!1&&(o.add(i),i.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(t){const e=this.materialCache.get(t);for(const n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const e=this.materialCache;let n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){const e=this.shaderCache;let n=e.get(t);return n===void 0&&(n=new I_(t),e.set(t,n)),n}}class I_{constructor(t){this.id=C_++,this.code=t,this.usedTimes=0}}function P_(s,t,e,n,i,r,o){const a=new Al,l=new R_,c=new Set,h=[],d=i.logarithmicDepthBuffer,u=i.vertexTextures;let f=i.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(S){return c.add(S),S===0?"uv":`uv${S}`}function m(S,x,P,F,N){const H=F.fog,z=N.geometry,V=S.isMeshStandardMaterial?F.environment:null,J=(S.isMeshStandardMaterial?e:t).get(S.envMap||V),W=J&&J.mapping===yo?J.image.height:null,rt=g[S.type];S.precision!==null&&(f=i.getMaxPrecision(S.precision),f!==S.precision&&console.warn("THREE.WebGLProgram.getParameters:",S.precision,"not supported, using",f,"instead."));const ft=z.morphAttributes.position||z.morphAttributes.normal||z.morphAttributes.color,At=ft!==void 0?ft.length:0;let Vt=0;z.morphAttributes.position!==void 0&&(Vt=1),z.morphAttributes.normal!==void 0&&(Vt=2),z.morphAttributes.color!==void 0&&(Vt=3);let de,K,st,Mt;if(rt){const re=Tn[rt];de=re.vertexShader,K=re.fragmentShader}else de=S.vertexShader,K=S.fragmentShader,l.update(S),st=l.getVertexShaderID(S),Mt=l.getFragmentShaderID(S);const lt=s.getRenderTarget(),Lt=s.state.buffers.depth.getReversed(),Ut=N.isInstancedMesh===!0,Wt=N.isBatchedMesh===!0,ye=!!S.map,Zt=!!S.matcap,we=!!J,O=!!S.aoMap,en=!!S.lightMap,$t=!!S.bumpMap,Kt=!!S.normalMap,Rt=!!S.displacementMap,me=!!S.emissiveMap,Ct=!!S.metalnessMap,A=!!S.roughnessMap,w=S.anisotropy>0,G=S.clearcoat>0,j=S.dispersion>0,tt=S.iridescence>0,$=S.sheen>0,St=S.transmission>0,ct=w&&!!S.anisotropyMap,pt=G&&!!S.clearcoatMap,Jt=G&&!!S.clearcoatNormalMap,nt=G&&!!S.clearcoatRoughnessMap,mt=tt&&!!S.iridescenceMap,Pt=tt&&!!S.iridescenceThicknessMap,Dt=$&&!!S.sheenColorMap,gt=$&&!!S.sheenRoughnessMap,jt=!!S.specularMap,Ht=!!S.specularColorMap,fe=!!S.specularIntensityMap,D=St&&!!S.transmissionMap,at=St&&!!S.thicknessMap,q=!!S.gradientMap,Z=!!S.alphaMap,ut=S.alphaTest>0,ht=!!S.alphaHash,Ft=!!S.extensions;let Me=Ti;S.toneMapped&&(lt===null||lt.isXRRenderTarget===!0)&&(Me=s.toneMapping);const De={shaderID:rt,shaderType:S.type,shaderName:S.name,vertexShader:de,fragmentShader:K,defines:S.defines,customVertexShaderID:st,customFragmentShaderID:Mt,isRawShaderMaterial:S.isRawShaderMaterial===!0,glslVersion:S.glslVersion,precision:f,batching:Wt,batchingColor:Wt&&N._colorsTexture!==null,instancing:Ut,instancingColor:Ut&&N.instanceColor!==null,instancingMorph:Ut&&N.morphTexture!==null,supportsVertexTextures:u,outputColorSpace:lt===null?s.outputColorSpace:lt.isXRRenderTarget===!0?lt.texture.colorSpace:Ye,alphaToCoverage:!!S.alphaToCoverage,map:ye,matcap:Zt,envMap:we,envMapMode:we&&J.mapping,envMapCubeUVHeight:W,aoMap:O,lightMap:en,bumpMap:$t,normalMap:Kt,displacementMap:u&&Rt,emissiveMap:me,normalMapObjectSpace:Kt&&S.normalMapType===wf,normalMapTangentSpace:Kt&&S.normalMapType===fd,metalnessMap:Ct,roughnessMap:A,anisotropy:w,anisotropyMap:ct,clearcoat:G,clearcoatMap:pt,clearcoatNormalMap:Jt,clearcoatRoughnessMap:nt,dispersion:j,iridescence:tt,iridescenceMap:mt,iridescenceThicknessMap:Pt,sheen:$,sheenColorMap:Dt,sheenRoughnessMap:gt,specularMap:jt,specularColorMap:Ht,specularIntensityMap:fe,transmission:St,transmissionMap:D,thicknessMap:at,gradientMap:q,opaque:S.transparent===!1&&S.blending===vs&&S.alphaToCoverage===!1,alphaMap:Z,alphaTest:ut,alphaHash:ht,combine:S.combine,mapUv:ye&&_(S.map.channel),aoMapUv:O&&_(S.aoMap.channel),lightMapUv:en&&_(S.lightMap.channel),bumpMapUv:$t&&_(S.bumpMap.channel),normalMapUv:Kt&&_(S.normalMap.channel),displacementMapUv:Rt&&_(S.displacementMap.channel),emissiveMapUv:me&&_(S.emissiveMap.channel),metalnessMapUv:Ct&&_(S.metalnessMap.channel),roughnessMapUv:A&&_(S.roughnessMap.channel),anisotropyMapUv:ct&&_(S.anisotropyMap.channel),clearcoatMapUv:pt&&_(S.clearcoatMap.channel),clearcoatNormalMapUv:Jt&&_(S.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:nt&&_(S.clearcoatRoughnessMap.channel),iridescenceMapUv:mt&&_(S.iridescenceMap.channel),iridescenceThicknessMapUv:Pt&&_(S.iridescenceThicknessMap.channel),sheenColorMapUv:Dt&&_(S.sheenColorMap.channel),sheenRoughnessMapUv:gt&&_(S.sheenRoughnessMap.channel),specularMapUv:jt&&_(S.specularMap.channel),specularColorMapUv:Ht&&_(S.specularColorMap.channel),specularIntensityMapUv:fe&&_(S.specularIntensityMap.channel),transmissionMapUv:D&&_(S.transmissionMap.channel),thicknessMapUv:at&&_(S.thicknessMap.channel),alphaMapUv:Z&&_(S.alphaMap.channel),vertexTangents:!!z.attributes.tangent&&(Kt||w),vertexColors:S.vertexColors,vertexAlphas:S.vertexColors===!0&&!!z.attributes.color&&z.attributes.color.itemSize===4,pointsUvs:N.isPoints===!0&&!!z.attributes.uv&&(ye||Z),fog:!!H,useFog:S.fog===!0,fogExp2:!!H&&H.isFogExp2,flatShading:S.flatShading===!0,sizeAttenuation:S.sizeAttenuation===!0,logarithmicDepthBuffer:d,reverseDepthBuffer:Lt,skinning:N.isSkinnedMesh===!0,morphTargets:z.morphAttributes.position!==void 0,morphNormals:z.morphAttributes.normal!==void 0,morphColors:z.morphAttributes.color!==void 0,morphTargetsCount:At,morphTextureStride:Vt,numDirLights:x.directional.length,numPointLights:x.point.length,numSpotLights:x.spot.length,numSpotLightMaps:x.spotLightMap.length,numRectAreaLights:x.rectArea.length,numHemiLights:x.hemi.length,numDirLightShadows:x.directionalShadowMap.length,numPointLightShadows:x.pointShadowMap.length,numSpotLightShadows:x.spotShadowMap.length,numSpotLightShadowsWithMaps:x.numSpotLightShadowsWithMaps,numLightProbes:x.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:S.dithering,shadowMapEnabled:s.shadowMap.enabled&&P.length>0,shadowMapType:s.shadowMap.type,toneMapping:Me,decodeVideoTexture:ye&&S.map.isVideoTexture===!0&&qt.getTransfer(S.map.colorSpace)===ce,decodeVideoTextureEmissive:me&&S.emissiveMap.isVideoTexture===!0&&qt.getTransfer(S.emissiveMap.colorSpace)===ce,premultipliedAlpha:S.premultipliedAlpha,doubleSided:S.side===oe,flipSided:S.side===ze,useDepthPacking:S.depthPacking>=0,depthPacking:S.depthPacking||0,index0AttributeName:S.index0AttributeName,extensionClipCullDistance:Ft&&S.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ft&&S.extensions.multiDraw===!0||Wt)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:S.customProgramCacheKey()};return De.vertexUv1s=c.has(1),De.vertexUv2s=c.has(2),De.vertexUv3s=c.has(3),c.clear(),De}function p(S){const x=[];if(S.shaderID?x.push(S.shaderID):(x.push(S.customVertexShaderID),x.push(S.customFragmentShaderID)),S.defines!==void 0)for(const P in S.defines)x.push(P),x.push(S.defines[P]);return S.isRawShaderMaterial===!1&&(y(x,S),M(x,S),x.push(s.outputColorSpace)),x.push(S.customProgramCacheKey),x.join()}function y(S,x){S.push(x.precision),S.push(x.outputColorSpace),S.push(x.envMapMode),S.push(x.envMapCubeUVHeight),S.push(x.mapUv),S.push(x.alphaMapUv),S.push(x.lightMapUv),S.push(x.aoMapUv),S.push(x.bumpMapUv),S.push(x.normalMapUv),S.push(x.displacementMapUv),S.push(x.emissiveMapUv),S.push(x.metalnessMapUv),S.push(x.roughnessMapUv),S.push(x.anisotropyMapUv),S.push(x.clearcoatMapUv),S.push(x.clearcoatNormalMapUv),S.push(x.clearcoatRoughnessMapUv),S.push(x.iridescenceMapUv),S.push(x.iridescenceThicknessMapUv),S.push(x.sheenColorMapUv),S.push(x.sheenRoughnessMapUv),S.push(x.specularMapUv),S.push(x.specularColorMapUv),S.push(x.specularIntensityMapUv),S.push(x.transmissionMapUv),S.push(x.thicknessMapUv),S.push(x.combine),S.push(x.fogExp2),S.push(x.sizeAttenuation),S.push(x.morphTargetsCount),S.push(x.morphAttributeCount),S.push(x.numDirLights),S.push(x.numPointLights),S.push(x.numSpotLights),S.push(x.numSpotLightMaps),S.push(x.numHemiLights),S.push(x.numRectAreaLights),S.push(x.numDirLightShadows),S.push(x.numPointLightShadows),S.push(x.numSpotLightShadows),S.push(x.numSpotLightShadowsWithMaps),S.push(x.numLightProbes),S.push(x.shadowMapType),S.push(x.toneMapping),S.push(x.numClippingPlanes),S.push(x.numClipIntersection),S.push(x.depthPacking)}function M(S,x){a.disableAll(),x.supportsVertexTextures&&a.enable(0),x.instancing&&a.enable(1),x.instancingColor&&a.enable(2),x.instancingMorph&&a.enable(3),x.matcap&&a.enable(4),x.envMap&&a.enable(5),x.normalMapObjectSpace&&a.enable(6),x.normalMapTangentSpace&&a.enable(7),x.clearcoat&&a.enable(8),x.iridescence&&a.enable(9),x.alphaTest&&a.enable(10),x.vertexColors&&a.enable(11),x.vertexAlphas&&a.enable(12),x.vertexUv1s&&a.enable(13),x.vertexUv2s&&a.enable(14),x.vertexUv3s&&a.enable(15),x.vertexTangents&&a.enable(16),x.anisotropy&&a.enable(17),x.alphaHash&&a.enable(18),x.batching&&a.enable(19),x.dispersion&&a.enable(20),x.batchingColor&&a.enable(21),S.push(a.mask),a.disableAll(),x.fog&&a.enable(0),x.useFog&&a.enable(1),x.flatShading&&a.enable(2),x.logarithmicDepthBuffer&&a.enable(3),x.reverseDepthBuffer&&a.enable(4),x.skinning&&a.enable(5),x.morphTargets&&a.enable(6),x.morphNormals&&a.enable(7),x.morphColors&&a.enable(8),x.premultipliedAlpha&&a.enable(9),x.shadowMapEnabled&&a.enable(10),x.doubleSided&&a.enable(11),x.flipSided&&a.enable(12),x.useDepthPacking&&a.enable(13),x.dithering&&a.enable(14),x.transmission&&a.enable(15),x.sheen&&a.enable(16),x.opaque&&a.enable(17),x.pointsUvs&&a.enable(18),x.decodeVideoTexture&&a.enable(19),x.decodeVideoTextureEmissive&&a.enable(20),x.alphaToCoverage&&a.enable(21),S.push(a.mask)}function v(S){const x=g[S.type];let P;if(x){const F=Tn[x];P=pp.clone(F.uniforms)}else P=S.uniforms;return P}function I(S,x){let P;for(let F=0,N=h.length;F<N;F++){const H=h[F];if(H.cacheKey===x){P=H,++P.usedTimes;break}}return P===void 0&&(P=new T_(s,x,S,r),h.push(P)),P}function T(S){if(--S.usedTimes===0){const x=h.indexOf(S);h[x]=h[h.length-1],h.pop(),S.destroy()}}function E(S){l.remove(S)}function C(){l.dispose()}return{getParameters:m,getProgramCacheKey:p,getUniforms:v,acquireProgram:I,releaseProgram:T,releaseShaderCache:E,programs:h,dispose:C}}function L_(){let s=new WeakMap;function t(o){return s.has(o)}function e(o){let a=s.get(o);return a===void 0&&(a={},s.set(o,a)),a}function n(o){s.delete(o)}function i(o,a,l){s.get(o)[a]=l}function r(){s=new WeakMap}return{has:t,get:e,remove:n,update:i,dispose:r}}function D_(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.material.id!==t.material.id?s.material.id-t.material.id:s.z!==t.z?s.z-t.z:s.id-t.id}function Zc(s,t){return s.groupOrder!==t.groupOrder?s.groupOrder-t.groupOrder:s.renderOrder!==t.renderOrder?s.renderOrder-t.renderOrder:s.z!==t.z?t.z-s.z:s.id-t.id}function Jc(){const s=[];let t=0;const e=[],n=[],i=[];function r(){t=0,e.length=0,n.length=0,i.length=0}function o(d,u,f,g,_,m){let p=s[t];return p===void 0?(p={id:d.id,object:d,geometry:u,material:f,groupOrder:g,renderOrder:d.renderOrder,z:_,group:m},s[t]=p):(p.id=d.id,p.object=d,p.geometry=u,p.material=f,p.groupOrder=g,p.renderOrder=d.renderOrder,p.z=_,p.group=m),t++,p}function a(d,u,f,g,_,m){const p=o(d,u,f,g,_,m);f.transmission>0?n.push(p):f.transparent===!0?i.push(p):e.push(p)}function l(d,u,f,g,_,m){const p=o(d,u,f,g,_,m);f.transmission>0?n.unshift(p):f.transparent===!0?i.unshift(p):e.unshift(p)}function c(d,u){e.length>1&&e.sort(d||D_),n.length>1&&n.sort(u||Zc),i.length>1&&i.sort(u||Zc)}function h(){for(let d=t,u=s.length;d<u;d++){const f=s[d];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:e,transmissive:n,transparent:i,init:r,push:a,unshift:l,finish:h,sort:c}}function N_(){let s=new WeakMap;function t(n,i){const r=s.get(n);let o;return r===void 0?(o=new Jc,s.set(n,[o])):i>=r.length?(o=new Jc,r.push(o)):o=r[i],o}function e(){s=new WeakMap}return{get:t,dispose:e}}function U_(){const s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new L,color:new It};break;case"SpotLight":e={position:new L,direction:new L,color:new It,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new L,color:new It,distance:0,decay:0};break;case"HemisphereLight":e={direction:new L,skyColor:new It,groundColor:new It};break;case"RectAreaLight":e={color:new It,position:new L,halfWidth:new L,halfHeight:new L};break}return s[t.id]=e,e}}}function k_(){const s={};return{get:function(t){if(s[t.id]!==void 0)return s[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new zt};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new zt};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new zt,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[t.id]=e,e}}}let F_=0;function O_(s,t){return(t.castShadow?2:0)-(s.castShadow?2:0)+(t.map?1:0)-(s.map?1:0)}function B_(s){const t=new U_,e=k_(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new L);const i=new L,r=new kt,o=new kt;function a(c){let h=0,d=0,u=0;for(let S=0;S<9;S++)n.probe[S].set(0,0,0);let f=0,g=0,_=0,m=0,p=0,y=0,M=0,v=0,I=0,T=0,E=0;c.sort(O_);for(let S=0,x=c.length;S<x;S++){const P=c[S],F=P.color,N=P.intensity,H=P.distance,z=P.shadow&&P.shadow.map?P.shadow.map.texture:null;if(P.isAmbientLight)h+=F.r*N,d+=F.g*N,u+=F.b*N;else if(P.isLightProbe){for(let V=0;V<9;V++)n.probe[V].addScaledVector(P.sh.coefficients[V],N);E++}else if(P.isDirectionalLight){const V=t.get(P);if(V.color.copy(P.color).multiplyScalar(P.intensity),P.castShadow){const J=P.shadow,W=e.get(P);W.shadowIntensity=J.intensity,W.shadowBias=J.bias,W.shadowNormalBias=J.normalBias,W.shadowRadius=J.radius,W.shadowMapSize=J.mapSize,n.directionalShadow[f]=W,n.directionalShadowMap[f]=z,n.directionalShadowMatrix[f]=P.shadow.matrix,y++}n.directional[f]=V,f++}else if(P.isSpotLight){const V=t.get(P);V.position.setFromMatrixPosition(P.matrixWorld),V.color.copy(F).multiplyScalar(N),V.distance=H,V.coneCos=Math.cos(P.angle),V.penumbraCos=Math.cos(P.angle*(1-P.penumbra)),V.decay=P.decay,n.spot[_]=V;const J=P.shadow;if(P.map&&(n.spotLightMap[I]=P.map,I++,J.updateMatrices(P),P.castShadow&&T++),n.spotLightMatrix[_]=J.matrix,P.castShadow){const W=e.get(P);W.shadowIntensity=J.intensity,W.shadowBias=J.bias,W.shadowNormalBias=J.normalBias,W.shadowRadius=J.radius,W.shadowMapSize=J.mapSize,n.spotShadow[_]=W,n.spotShadowMap[_]=z,v++}_++}else if(P.isRectAreaLight){const V=t.get(P);V.color.copy(F).multiplyScalar(N),V.halfWidth.set(P.width*.5,0,0),V.halfHeight.set(0,P.height*.5,0),n.rectArea[m]=V,m++}else if(P.isPointLight){const V=t.get(P);if(V.color.copy(P.color).multiplyScalar(P.intensity),V.distance=P.distance,V.decay=P.decay,P.castShadow){const J=P.shadow,W=e.get(P);W.shadowIntensity=J.intensity,W.shadowBias=J.bias,W.shadowNormalBias=J.normalBias,W.shadowRadius=J.radius,W.shadowMapSize=J.mapSize,W.shadowCameraNear=J.camera.near,W.shadowCameraFar=J.camera.far,n.pointShadow[g]=W,n.pointShadowMap[g]=z,n.pointShadowMatrix[g]=P.shadow.matrix,M++}n.point[g]=V,g++}else if(P.isHemisphereLight){const V=t.get(P);V.skyColor.copy(P.color).multiplyScalar(N),V.groundColor.copy(P.groundColor).multiplyScalar(N),n.hemi[p]=V,p++}}m>0&&(s.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=ot.LTC_FLOAT_1,n.rectAreaLTC2=ot.LTC_FLOAT_2):(n.rectAreaLTC1=ot.LTC_HALF_1,n.rectAreaLTC2=ot.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=d,n.ambient[2]=u;const C=n.hash;(C.directionalLength!==f||C.pointLength!==g||C.spotLength!==_||C.rectAreaLength!==m||C.hemiLength!==p||C.numDirectionalShadows!==y||C.numPointShadows!==M||C.numSpotShadows!==v||C.numSpotMaps!==I||C.numLightProbes!==E)&&(n.directional.length=f,n.spot.length=_,n.rectArea.length=m,n.point.length=g,n.hemi.length=p,n.directionalShadow.length=y,n.directionalShadowMap.length=y,n.pointShadow.length=M,n.pointShadowMap.length=M,n.spotShadow.length=v,n.spotShadowMap.length=v,n.directionalShadowMatrix.length=y,n.pointShadowMatrix.length=M,n.spotLightMatrix.length=v+I-T,n.spotLightMap.length=I,n.numSpotLightShadowsWithMaps=T,n.numLightProbes=E,C.directionalLength=f,C.pointLength=g,C.spotLength=_,C.rectAreaLength=m,C.hemiLength=p,C.numDirectionalShadows=y,C.numPointShadows=M,C.numSpotShadows=v,C.numSpotMaps=I,C.numLightProbes=E,n.version=F_++)}function l(c,h){let d=0,u=0,f=0,g=0,_=0;const m=h.matrixWorldInverse;for(let p=0,y=c.length;p<y;p++){const M=c[p];if(M.isDirectionalLight){const v=n.directional[d];v.direction.setFromMatrixPosition(M.matrixWorld),i.setFromMatrixPosition(M.target.matrixWorld),v.direction.sub(i),v.direction.transformDirection(m),d++}else if(M.isSpotLight){const v=n.spot[f];v.position.setFromMatrixPosition(M.matrixWorld),v.position.applyMatrix4(m),v.direction.setFromMatrixPosition(M.matrixWorld),i.setFromMatrixPosition(M.target.matrixWorld),v.direction.sub(i),v.direction.transformDirection(m),f++}else if(M.isRectAreaLight){const v=n.rectArea[g];v.position.setFromMatrixPosition(M.matrixWorld),v.position.applyMatrix4(m),o.identity(),r.copy(M.matrixWorld),r.premultiply(m),o.extractRotation(r),v.halfWidth.set(M.width*.5,0,0),v.halfHeight.set(0,M.height*.5,0),v.halfWidth.applyMatrix4(o),v.halfHeight.applyMatrix4(o),g++}else if(M.isPointLight){const v=n.point[u];v.position.setFromMatrixPosition(M.matrixWorld),v.position.applyMatrix4(m),u++}else if(M.isHemisphereLight){const v=n.hemi[_];v.direction.setFromMatrixPosition(M.matrixWorld),v.direction.transformDirection(m),_++}}}return{setup:a,setupView:l,state:n}}function Qc(s){const t=new B_(s),e=[],n=[];function i(h){c.camera=h,e.length=0,n.length=0}function r(h){e.push(h)}function o(h){n.push(h)}function a(){t.setup(e)}function l(h){t.setupView(e,h)}const c={lightsArray:e,shadowsArray:n,camera:null,lights:t,transmissionRenderTarget:{}};return{init:i,state:c,setupLights:a,setupLightsView:l,pushLight:r,pushShadow:o}}function H_(s){let t=new WeakMap;function e(i,r=0){const o=t.get(i);let a;return o===void 0?(a=new Qc(s),t.set(i,[a])):r>=o.length?(a=new Qc(s),o.push(a)):a=o[r],a}function n(){t=new WeakMap}return{get:e,dispose:n}}class G_ extends Rn{static get type(){return"MeshDepthMaterial"}constructor(t){super(),this.isMeshDepthMaterial=!0,this.depthPacking=Mf,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class z_ extends Rn{static get type(){return"MeshDistanceMaterial"}constructor(t){super(),this.isMeshDistanceMaterial=!0,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}const V_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,W_=`uniform sampler2D shadow_pass;
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
}`;function X_(s,t,e){let n=new Tl;const i=new zt,r=new zt,o=new ee,a=new G_({depthPacking:Sf}),l=new z_,c={},h=e.maxTextureSize,d={[ti]:ze,[ze]:ti,[oe]:oe},u=new Ii({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new zt},radius:{value:4}},vertexShader:V_,fragmentShader:W_}),f=u.clone();f.defines.HORIZONTAL_PASS=1;const g=new qe;g.setAttribute("position",new We(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const _=new R(g,u),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Kh;let p=this.type;this.render=function(T,E,C){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||T.length===0)return;const S=s.getRenderTarget(),x=s.getActiveCubeFace(),P=s.getActiveMipmapLevel(),F=s.state;F.setBlending(Ai),F.buffers.color.setClear(1,1,1,1),F.buffers.depth.setTest(!0),F.setScissorTest(!1);const N=p!==Yn&&this.type===Yn,H=p===Yn&&this.type!==Yn;for(let z=0,V=T.length;z<V;z++){const J=T[z],W=J.shadow;if(W===void 0){console.warn("THREE.WebGLShadowMap:",J,"has no shadow.");continue}if(W.autoUpdate===!1&&W.needsUpdate===!1)continue;i.copy(W.mapSize);const rt=W.getFrameExtents();if(i.multiply(rt),r.copy(W.mapSize),(i.x>h||i.y>h)&&(i.x>h&&(r.x=Math.floor(h/rt.x),i.x=r.x*rt.x,W.mapSize.x=r.x),i.y>h&&(r.y=Math.floor(h/rt.y),i.y=r.y*rt.y,W.mapSize.y=r.y)),W.map===null||N===!0||H===!0){const At=this.type!==Yn?{minFilter:Ve,magFilter:Ve}:{};W.map!==null&&W.map.dispose(),W.map=new $i(i.x,i.y,At),W.map.texture.name=J.name+".shadowMap",W.camera.updateProjectionMatrix()}s.setRenderTarget(W.map),s.clear();const ft=W.getViewportCount();for(let At=0;At<ft;At++){const Vt=W.getViewport(At);o.set(r.x*Vt.x,r.y*Vt.y,r.x*Vt.z,r.y*Vt.w),F.viewport(o),W.updateMatrices(J,At),n=W.getFrustum(),v(E,C,W.camera,J,this.type)}W.isPointLightShadow!==!0&&this.type===Yn&&y(W,C),W.needsUpdate=!1}p=this.type,m.needsUpdate=!1,s.setRenderTarget(S,x,P)};function y(T,E){const C=t.update(_);u.defines.VSM_SAMPLES!==T.blurSamples&&(u.defines.VSM_SAMPLES=T.blurSamples,f.defines.VSM_SAMPLES=T.blurSamples,u.needsUpdate=!0,f.needsUpdate=!0),T.mapPass===null&&(T.mapPass=new $i(i.x,i.y)),u.uniforms.shadow_pass.value=T.map.texture,u.uniforms.resolution.value=T.mapSize,u.uniforms.radius.value=T.radius,s.setRenderTarget(T.mapPass),s.clear(),s.renderBufferDirect(E,null,C,u,_,null),f.uniforms.shadow_pass.value=T.mapPass.texture,f.uniforms.resolution.value=T.mapSize,f.uniforms.radius.value=T.radius,s.setRenderTarget(T.map),s.clear(),s.renderBufferDirect(E,null,C,f,_,null)}function M(T,E,C,S){let x=null;const P=C.isPointLight===!0?T.customDistanceMaterial:T.customDepthMaterial;if(P!==void 0)x=P;else if(x=C.isPointLight===!0?l:a,s.localClippingEnabled&&E.clipShadows===!0&&Array.isArray(E.clippingPlanes)&&E.clippingPlanes.length!==0||E.displacementMap&&E.displacementScale!==0||E.alphaMap&&E.alphaTest>0||E.map&&E.alphaTest>0){const F=x.uuid,N=E.uuid;let H=c[F];H===void 0&&(H={},c[F]=H);let z=H[N];z===void 0&&(z=x.clone(),H[N]=z,E.addEventListener("dispose",I)),x=z}if(x.visible=E.visible,x.wireframe=E.wireframe,S===Yn?x.side=E.shadowSide!==null?E.shadowSide:E.side:x.side=E.shadowSide!==null?E.shadowSide:d[E.side],x.alphaMap=E.alphaMap,x.alphaTest=E.alphaTest,x.map=E.map,x.clipShadows=E.clipShadows,x.clippingPlanes=E.clippingPlanes,x.clipIntersection=E.clipIntersection,x.displacementMap=E.displacementMap,x.displacementScale=E.displacementScale,x.displacementBias=E.displacementBias,x.wireframeLinewidth=E.wireframeLinewidth,x.linewidth=E.linewidth,C.isPointLight===!0&&x.isMeshDistanceMaterial===!0){const F=s.properties.get(x);F.light=C}return x}function v(T,E,C,S,x){if(T.visible===!1)return;if(T.layers.test(E.layers)&&(T.isMesh||T.isLine||T.isPoints)&&(T.castShadow||T.receiveShadow&&x===Yn)&&(!T.frustumCulled||n.intersectsObject(T))){T.modelViewMatrix.multiplyMatrices(C.matrixWorldInverse,T.matrixWorld);const N=t.update(T),H=T.material;if(Array.isArray(H)){const z=N.groups;for(let V=0,J=z.length;V<J;V++){const W=z[V],rt=H[W.materialIndex];if(rt&&rt.visible){const ft=M(T,rt,S,x);T.onBeforeShadow(s,T,E,C,N,ft,W),s.renderBufferDirect(C,null,N,ft,T,W),T.onAfterShadow(s,T,E,C,N,ft,W)}}}else if(H.visible){const z=M(T,H,S,x);T.onBeforeShadow(s,T,E,C,N,z,null),s.renderBufferDirect(C,null,N,z,T,null),T.onAfterShadow(s,T,E,C,N,z,null)}}const F=T.children;for(let N=0,H=F.length;N<H;N++)v(F[N],E,C,S,x)}function I(T){T.target.removeEventListener("dispose",I);for(const C in c){const S=c[C],x=T.target.uuid;x in S&&(S[x].dispose(),delete S[x])}}}const Y_={[xa]:ya,[Ma]:ba,[Sa]:Ea,[As]:wa,[ya]:xa,[ba]:Ma,[Ea]:Sa,[wa]:As};function q_(s,t){function e(){let D=!1;const at=new ee;let q=null;const Z=new ee(0,0,0,0);return{setMask:function(ut){q!==ut&&!D&&(s.colorMask(ut,ut,ut,ut),q=ut)},setLocked:function(ut){D=ut},setClear:function(ut,ht,Ft,Me,De){De===!0&&(ut*=Me,ht*=Me,Ft*=Me),at.set(ut,ht,Ft,Me),Z.equals(at)===!1&&(s.clearColor(ut,ht,Ft,Me),Z.copy(at))},reset:function(){D=!1,q=null,Z.set(-1,0,0,0)}}}function n(){let D=!1,at=!1,q=null,Z=null,ut=null;return{setReversed:function(ht){if(at!==ht){const Ft=t.get("EXT_clip_control");at?Ft.clipControlEXT(Ft.LOWER_LEFT_EXT,Ft.ZERO_TO_ONE_EXT):Ft.clipControlEXT(Ft.LOWER_LEFT_EXT,Ft.NEGATIVE_ONE_TO_ONE_EXT);const Me=ut;ut=null,this.setClear(Me)}at=ht},getReversed:function(){return at},setTest:function(ht){ht?lt(s.DEPTH_TEST):Lt(s.DEPTH_TEST)},setMask:function(ht){q!==ht&&!D&&(s.depthMask(ht),q=ht)},setFunc:function(ht){if(at&&(ht=Y_[ht]),Z!==ht){switch(ht){case xa:s.depthFunc(s.NEVER);break;case ya:s.depthFunc(s.ALWAYS);break;case Ma:s.depthFunc(s.LESS);break;case As:s.depthFunc(s.LEQUAL);break;case Sa:s.depthFunc(s.EQUAL);break;case wa:s.depthFunc(s.GEQUAL);break;case ba:s.depthFunc(s.GREATER);break;case Ea:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}Z=ht}},setLocked:function(ht){D=ht},setClear:function(ht){ut!==ht&&(at&&(ht=1-ht),s.clearDepth(ht),ut=ht)},reset:function(){D=!1,q=null,Z=null,ut=null,at=!1}}}function i(){let D=!1,at=null,q=null,Z=null,ut=null,ht=null,Ft=null,Me=null,De=null;return{setTest:function(re){D||(re?lt(s.STENCIL_TEST):Lt(s.STENCIL_TEST))},setMask:function(re){at!==re&&!D&&(s.stencilMask(re),at=re)},setFunc:function(re,dn,kn){(q!==re||Z!==dn||ut!==kn)&&(s.stencilFunc(re,dn,kn),q=re,Z=dn,ut=kn)},setOp:function(re,dn,kn){(ht!==re||Ft!==dn||Me!==kn)&&(s.stencilOp(re,dn,kn),ht=re,Ft=dn,Me=kn)},setLocked:function(re){D=re},setClear:function(re){De!==re&&(s.clearStencil(re),De=re)},reset:function(){D=!1,at=null,q=null,Z=null,ut=null,ht=null,Ft=null,Me=null,De=null}}}const r=new e,o=new n,a=new i,l=new WeakMap,c=new WeakMap;let h={},d={},u=new WeakMap,f=[],g=null,_=!1,m=null,p=null,y=null,M=null,v=null,I=null,T=null,E=new It(0,0,0),C=0,S=!1,x=null,P=null,F=null,N=null,H=null;const z=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let V=!1,J=0;const W=s.getParameter(s.VERSION);W.indexOf("WebGL")!==-1?(J=parseFloat(/^WebGL (\d)/.exec(W)[1]),V=J>=1):W.indexOf("OpenGL ES")!==-1&&(J=parseFloat(/^OpenGL ES (\d)/.exec(W)[1]),V=J>=2);let rt=null,ft={};const At=s.getParameter(s.SCISSOR_BOX),Vt=s.getParameter(s.VIEWPORT),de=new ee().fromArray(At),K=new ee().fromArray(Vt);function st(D,at,q,Z){const ut=new Uint8Array(4),ht=s.createTexture();s.bindTexture(D,ht),s.texParameteri(D,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(D,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let Ft=0;Ft<q;Ft++)D===s.TEXTURE_3D||D===s.TEXTURE_2D_ARRAY?s.texImage3D(at,0,s.RGBA,1,1,Z,0,s.RGBA,s.UNSIGNED_BYTE,ut):s.texImage2D(at+Ft,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,ut);return ht}const Mt={};Mt[s.TEXTURE_2D]=st(s.TEXTURE_2D,s.TEXTURE_2D,1),Mt[s.TEXTURE_CUBE_MAP]=st(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),Mt[s.TEXTURE_2D_ARRAY]=st(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),Mt[s.TEXTURE_3D]=st(s.TEXTURE_3D,s.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),lt(s.DEPTH_TEST),o.setFunc(As),$t(!1),Kt(nc),lt(s.CULL_FACE),O(Ai);function lt(D){h[D]!==!0&&(s.enable(D),h[D]=!0)}function Lt(D){h[D]!==!1&&(s.disable(D),h[D]=!1)}function Ut(D,at){return d[D]!==at?(s.bindFramebuffer(D,at),d[D]=at,D===s.DRAW_FRAMEBUFFER&&(d[s.FRAMEBUFFER]=at),D===s.FRAMEBUFFER&&(d[s.DRAW_FRAMEBUFFER]=at),!0):!1}function Wt(D,at){let q=f,Z=!1;if(D){q=u.get(at),q===void 0&&(q=[],u.set(at,q));const ut=D.textures;if(q.length!==ut.length||q[0]!==s.COLOR_ATTACHMENT0){for(let ht=0,Ft=ut.length;ht<Ft;ht++)q[ht]=s.COLOR_ATTACHMENT0+ht;q.length=ut.length,Z=!0}}else q[0]!==s.BACK&&(q[0]=s.BACK,Z=!0);Z&&s.drawBuffers(q)}function ye(D){return g!==D?(s.useProgram(D),g=D,!0):!1}const Zt={[Gi]:s.FUNC_ADD,[Xu]:s.FUNC_SUBTRACT,[Yu]:s.FUNC_REVERSE_SUBTRACT};Zt[qu]=s.MIN,Zt[$u]=s.MAX;const we={[Ku]:s.ZERO,[ju]:s.ONE,[Zu]:s.SRC_COLOR,[_a]:s.SRC_ALPHA,[sf]:s.SRC_ALPHA_SATURATE,[ef]:s.DST_COLOR,[Qu]:s.DST_ALPHA,[Ju]:s.ONE_MINUS_SRC_COLOR,[va]:s.ONE_MINUS_SRC_ALPHA,[nf]:s.ONE_MINUS_DST_COLOR,[tf]:s.ONE_MINUS_DST_ALPHA,[rf]:s.CONSTANT_COLOR,[of]:s.ONE_MINUS_CONSTANT_COLOR,[af]:s.CONSTANT_ALPHA,[lf]:s.ONE_MINUS_CONSTANT_ALPHA};function O(D,at,q,Z,ut,ht,Ft,Me,De,re){if(D===Ai){_===!0&&(Lt(s.BLEND),_=!1);return}if(_===!1&&(lt(s.BLEND),_=!0),D!==Wu){if(D!==m||re!==S){if((p!==Gi||v!==Gi)&&(s.blendEquation(s.FUNC_ADD),p=Gi,v=Gi),re)switch(D){case vs:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case ic:s.blendFunc(s.ONE,s.ONE);break;case sc:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case rc:s.blendFuncSeparate(s.ZERO,s.SRC_COLOR,s.ZERO,s.SRC_ALPHA);break;default:console.error("THREE.WebGLState: Invalid blending: ",D);break}else switch(D){case vs:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case ic:s.blendFunc(s.SRC_ALPHA,s.ONE);break;case sc:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case rc:s.blendFunc(s.ZERO,s.SRC_COLOR);break;default:console.error("THREE.WebGLState: Invalid blending: ",D);break}y=null,M=null,I=null,T=null,E.set(0,0,0),C=0,m=D,S=re}return}ut=ut||at,ht=ht||q,Ft=Ft||Z,(at!==p||ut!==v)&&(s.blendEquationSeparate(Zt[at],Zt[ut]),p=at,v=ut),(q!==y||Z!==M||ht!==I||Ft!==T)&&(s.blendFuncSeparate(we[q],we[Z],we[ht],we[Ft]),y=q,M=Z,I=ht,T=Ft),(Me.equals(E)===!1||De!==C)&&(s.blendColor(Me.r,Me.g,Me.b,De),E.copy(Me),C=De),m=D,S=!1}function en(D,at){D.side===oe?Lt(s.CULL_FACE):lt(s.CULL_FACE);let q=D.side===ze;at&&(q=!q),$t(q),D.blending===vs&&D.transparent===!1?O(Ai):O(D.blending,D.blendEquation,D.blendSrc,D.blendDst,D.blendEquationAlpha,D.blendSrcAlpha,D.blendDstAlpha,D.blendColor,D.blendAlpha,D.premultipliedAlpha),o.setFunc(D.depthFunc),o.setTest(D.depthTest),o.setMask(D.depthWrite),r.setMask(D.colorWrite);const Z=D.stencilWrite;a.setTest(Z),Z&&(a.setMask(D.stencilWriteMask),a.setFunc(D.stencilFunc,D.stencilRef,D.stencilFuncMask),a.setOp(D.stencilFail,D.stencilZFail,D.stencilZPass)),me(D.polygonOffset,D.polygonOffsetFactor,D.polygonOffsetUnits),D.alphaToCoverage===!0?lt(s.SAMPLE_ALPHA_TO_COVERAGE):Lt(s.SAMPLE_ALPHA_TO_COVERAGE)}function $t(D){x!==D&&(D?s.frontFace(s.CW):s.frontFace(s.CCW),x=D)}function Kt(D){D!==zu?(lt(s.CULL_FACE),D!==P&&(D===nc?s.cullFace(s.BACK):D===Vu?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):Lt(s.CULL_FACE),P=D}function Rt(D){D!==F&&(V&&s.lineWidth(D),F=D)}function me(D,at,q){D?(lt(s.POLYGON_OFFSET_FILL),(N!==at||H!==q)&&(s.polygonOffset(at,q),N=at,H=q)):Lt(s.POLYGON_OFFSET_FILL)}function Ct(D){D?lt(s.SCISSOR_TEST):Lt(s.SCISSOR_TEST)}function A(D){D===void 0&&(D=s.TEXTURE0+z-1),rt!==D&&(s.activeTexture(D),rt=D)}function w(D,at,q){q===void 0&&(rt===null?q=s.TEXTURE0+z-1:q=rt);let Z=ft[q];Z===void 0&&(Z={type:void 0,texture:void 0},ft[q]=Z),(Z.type!==D||Z.texture!==at)&&(rt!==q&&(s.activeTexture(q),rt=q),s.bindTexture(D,at||Mt[D]),Z.type=D,Z.texture=at)}function G(){const D=ft[rt];D!==void 0&&D.type!==void 0&&(s.bindTexture(D.type,null),D.type=void 0,D.texture=void 0)}function j(){try{s.compressedTexImage2D.apply(s,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function tt(){try{s.compressedTexImage3D.apply(s,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function $(){try{s.texSubImage2D.apply(s,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function St(){try{s.texSubImage3D.apply(s,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function ct(){try{s.compressedTexSubImage2D.apply(s,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function pt(){try{s.compressedTexSubImage3D.apply(s,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Jt(){try{s.texStorage2D.apply(s,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function nt(){try{s.texStorage3D.apply(s,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function mt(){try{s.texImage2D.apply(s,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Pt(){try{s.texImage3D.apply(s,arguments)}catch(D){console.error("THREE.WebGLState:",D)}}function Dt(D){de.equals(D)===!1&&(s.scissor(D.x,D.y,D.z,D.w),de.copy(D))}function gt(D){K.equals(D)===!1&&(s.viewport(D.x,D.y,D.z,D.w),K.copy(D))}function jt(D,at){let q=c.get(at);q===void 0&&(q=new WeakMap,c.set(at,q));let Z=q.get(D);Z===void 0&&(Z=s.getUniformBlockIndex(at,D.name),q.set(D,Z))}function Ht(D,at){const Z=c.get(at).get(D);l.get(at)!==Z&&(s.uniformBlockBinding(at,Z,D.__bindingPointIndex),l.set(at,Z))}function fe(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),o.setReversed(!1),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),h={},rt=null,ft={},d={},u=new WeakMap,f=[],g=null,_=!1,m=null,p=null,y=null,M=null,v=null,I=null,T=null,E=new It(0,0,0),C=0,S=!1,x=null,P=null,F=null,N=null,H=null,de.set(0,0,s.canvas.width,s.canvas.height),K.set(0,0,s.canvas.width,s.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:lt,disable:Lt,bindFramebuffer:Ut,drawBuffers:Wt,useProgram:ye,setBlending:O,setMaterial:en,setFlipSided:$t,setCullFace:Kt,setLineWidth:Rt,setPolygonOffset:me,setScissorTest:Ct,activeTexture:A,bindTexture:w,unbindTexture:G,compressedTexImage2D:j,compressedTexImage3D:tt,texImage2D:mt,texImage3D:Pt,updateUBOMapping:jt,uniformBlockBinding:Ht,texStorage2D:Jt,texStorage3D:nt,texSubImage2D:$,texSubImage3D:St,compressedTexSubImage2D:ct,compressedTexSubImage3D:pt,scissor:Dt,viewport:gt,reset:fe}}function th(s,t,e,n){const i=$_(n);switch(e){case sd:return s*t;case od:return s*t;case ad:return s*t*2;case yl:return s*t/i.components*i.byteLength;case Ml:return s*t/i.components*i.byteLength;case ld:return s*t*2/i.components*i.byteLength;case Sl:return s*t*2/i.components*i.byteLength;case rd:return s*t*3/i.components*i.byteLength;case cn:return s*t*4/i.components*i.byteLength;case wl:return s*t*4/i.components*i.byteLength;case Zr:case Jr:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case Qr:case to:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case Ra:case Pa:return Math.max(s,16)*Math.max(t,8)/4;case Ca:case Ia:return Math.max(s,8)*Math.max(t,8)/2;case La:case Da:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*8;case Na:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case Ua:return Math.floor((s+3)/4)*Math.floor((t+3)/4)*16;case ka:return Math.floor((s+4)/5)*Math.floor((t+3)/4)*16;case Fa:return Math.floor((s+4)/5)*Math.floor((t+4)/5)*16;case Oa:return Math.floor((s+5)/6)*Math.floor((t+4)/5)*16;case Ba:return Math.floor((s+5)/6)*Math.floor((t+5)/6)*16;case Ha:return Math.floor((s+7)/8)*Math.floor((t+4)/5)*16;case Ga:return Math.floor((s+7)/8)*Math.floor((t+5)/6)*16;case za:return Math.floor((s+7)/8)*Math.floor((t+7)/8)*16;case Va:return Math.floor((s+9)/10)*Math.floor((t+4)/5)*16;case Wa:return Math.floor((s+9)/10)*Math.floor((t+5)/6)*16;case Xa:return Math.floor((s+9)/10)*Math.floor((t+7)/8)*16;case Ya:return Math.floor((s+9)/10)*Math.floor((t+9)/10)*16;case qa:return Math.floor((s+11)/12)*Math.floor((t+9)/10)*16;case $a:return Math.floor((s+11)/12)*Math.floor((t+11)/12)*16;case eo:case Ka:case ja:return Math.ceil(s/4)*Math.ceil(t/4)*16;case cd:case Za:return Math.ceil(s/4)*Math.ceil(t/4)*8;case Ja:case Qa:return Math.ceil(s/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function $_(s){switch(s){case ei:case ed:return{byteLength:1,components:1};case lr:case nd:case fr:return{byteLength:2,components:1};case vl:case xl:return{byteLength:2,components:4};case qi:case _l:case yn:return{byteLength:4,components:1};case id:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${s}.`)}function K_(s,t,e,n,i,r,o){const a=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new zt,h=new WeakMap;let d;const u=new WeakMap;let f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(A,w){return f?new OffscreenCanvas(A,w):dr("canvas")}function _(A,w,G){let j=1;const tt=Ct(A);if((tt.width>G||tt.height>G)&&(j=G/Math.max(tt.width,tt.height)),j<1)if(typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&A instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&A instanceof ImageBitmap||typeof VideoFrame<"u"&&A instanceof VideoFrame){const $=Math.floor(j*tt.width),St=Math.floor(j*tt.height);d===void 0&&(d=g($,St));const ct=w?g($,St):d;return ct.width=$,ct.height=St,ct.getContext("2d").drawImage(A,0,0,$,St),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+tt.width+"x"+tt.height+") to ("+$+"x"+St+")."),ct}else return"data"in A&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+tt.width+"x"+tt.height+")."),A;return A}function m(A){return A.generateMipmaps}function p(A){s.generateMipmap(A)}function y(A){return A.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:A.isWebGL3DRenderTarget?s.TEXTURE_3D:A.isWebGLArrayRenderTarget||A.isCompressedArrayTexture?s.TEXTURE_2D_ARRAY:s.TEXTURE_2D}function M(A,w,G,j,tt=!1){if(A!==null){if(s[A]!==void 0)return s[A];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+A+"'")}let $=w;if(w===s.RED&&(G===s.FLOAT&&($=s.R32F),G===s.HALF_FLOAT&&($=s.R16F),G===s.UNSIGNED_BYTE&&($=s.R8)),w===s.RED_INTEGER&&(G===s.UNSIGNED_BYTE&&($=s.R8UI),G===s.UNSIGNED_SHORT&&($=s.R16UI),G===s.UNSIGNED_INT&&($=s.R32UI),G===s.BYTE&&($=s.R8I),G===s.SHORT&&($=s.R16I),G===s.INT&&($=s.R32I)),w===s.RG&&(G===s.FLOAT&&($=s.RG32F),G===s.HALF_FLOAT&&($=s.RG16F),G===s.UNSIGNED_BYTE&&($=s.RG8)),w===s.RG_INTEGER&&(G===s.UNSIGNED_BYTE&&($=s.RG8UI),G===s.UNSIGNED_SHORT&&($=s.RG16UI),G===s.UNSIGNED_INT&&($=s.RG32UI),G===s.BYTE&&($=s.RG8I),G===s.SHORT&&($=s.RG16I),G===s.INT&&($=s.RG32I)),w===s.RGB_INTEGER&&(G===s.UNSIGNED_BYTE&&($=s.RGB8UI),G===s.UNSIGNED_SHORT&&($=s.RGB16UI),G===s.UNSIGNED_INT&&($=s.RGB32UI),G===s.BYTE&&($=s.RGB8I),G===s.SHORT&&($=s.RGB16I),G===s.INT&&($=s.RGB32I)),w===s.RGBA_INTEGER&&(G===s.UNSIGNED_BYTE&&($=s.RGBA8UI),G===s.UNSIGNED_SHORT&&($=s.RGBA16UI),G===s.UNSIGNED_INT&&($=s.RGBA32UI),G===s.BYTE&&($=s.RGBA8I),G===s.SHORT&&($=s.RGBA16I),G===s.INT&&($=s.RGBA32I)),w===s.RGB&&G===s.UNSIGNED_INT_5_9_9_9_REV&&($=s.RGB9_E5),w===s.RGBA){const St=tt?Mo:qt.getTransfer(j);G===s.FLOAT&&($=s.RGBA32F),G===s.HALF_FLOAT&&($=s.RGBA16F),G===s.UNSIGNED_BYTE&&($=St===ce?s.SRGB8_ALPHA8:s.RGBA8),G===s.UNSIGNED_SHORT_4_4_4_4&&($=s.RGBA4),G===s.UNSIGNED_SHORT_5_5_5_1&&($=s.RGB5_A1)}return($===s.R16F||$===s.R32F||$===s.RG16F||$===s.RG32F||$===s.RGBA16F||$===s.RGBA32F)&&t.get("EXT_color_buffer_float"),$}function v(A,w){let G;return A?w===null||w===qi||w===Rs?G=s.DEPTH24_STENCIL8:w===yn?G=s.DEPTH32F_STENCIL8:w===lr&&(G=s.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):w===null||w===qi||w===Rs?G=s.DEPTH_COMPONENT24:w===yn?G=s.DEPTH_COMPONENT32F:w===lr&&(G=s.DEPTH_COMPONENT16),G}function I(A,w){return m(A)===!0||A.isFramebufferTexture&&A.minFilter!==Ve&&A.minFilter!==Qe?Math.log2(Math.max(w.width,w.height))+1:A.mipmaps!==void 0&&A.mipmaps.length>0?A.mipmaps.length:A.isCompressedTexture&&Array.isArray(A.image)?w.mipmaps.length:1}function T(A){const w=A.target;w.removeEventListener("dispose",T),C(w),w.isVideoTexture&&h.delete(w)}function E(A){const w=A.target;w.removeEventListener("dispose",E),x(w)}function C(A){const w=n.get(A);if(w.__webglInit===void 0)return;const G=A.source,j=u.get(G);if(j){const tt=j[w.__cacheKey];tt.usedTimes--,tt.usedTimes===0&&S(A),Object.keys(j).length===0&&u.delete(G)}n.remove(A)}function S(A){const w=n.get(A);s.deleteTexture(w.__webglTexture);const G=A.source,j=u.get(G);delete j[w.__cacheKey],o.memory.textures--}function x(A){const w=n.get(A);if(A.depthTexture&&(A.depthTexture.dispose(),n.remove(A.depthTexture)),A.isWebGLCubeRenderTarget)for(let j=0;j<6;j++){if(Array.isArray(w.__webglFramebuffer[j]))for(let tt=0;tt<w.__webglFramebuffer[j].length;tt++)s.deleteFramebuffer(w.__webglFramebuffer[j][tt]);else s.deleteFramebuffer(w.__webglFramebuffer[j]);w.__webglDepthbuffer&&s.deleteRenderbuffer(w.__webglDepthbuffer[j])}else{if(Array.isArray(w.__webglFramebuffer))for(let j=0;j<w.__webglFramebuffer.length;j++)s.deleteFramebuffer(w.__webglFramebuffer[j]);else s.deleteFramebuffer(w.__webglFramebuffer);if(w.__webglDepthbuffer&&s.deleteRenderbuffer(w.__webglDepthbuffer),w.__webglMultisampledFramebuffer&&s.deleteFramebuffer(w.__webglMultisampledFramebuffer),w.__webglColorRenderbuffer)for(let j=0;j<w.__webglColorRenderbuffer.length;j++)w.__webglColorRenderbuffer[j]&&s.deleteRenderbuffer(w.__webglColorRenderbuffer[j]);w.__webglDepthRenderbuffer&&s.deleteRenderbuffer(w.__webglDepthRenderbuffer)}const G=A.textures;for(let j=0,tt=G.length;j<tt;j++){const $=n.get(G[j]);$.__webglTexture&&(s.deleteTexture($.__webglTexture),o.memory.textures--),n.remove(G[j])}n.remove(A)}let P=0;function F(){P=0}function N(){const A=P;return A>=i.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+A+" texture units while this GPU supports only "+i.maxTextures),P+=1,A}function H(A){const w=[];return w.push(A.wrapS),w.push(A.wrapT),w.push(A.wrapR||0),w.push(A.magFilter),w.push(A.minFilter),w.push(A.anisotropy),w.push(A.internalFormat),w.push(A.format),w.push(A.type),w.push(A.generateMipmaps),w.push(A.premultiplyAlpha),w.push(A.flipY),w.push(A.unpackAlignment),w.push(A.colorSpace),w.join()}function z(A,w){const G=n.get(A);if(A.isVideoTexture&&Rt(A),A.isRenderTargetTexture===!1&&A.version>0&&G.__version!==A.version){const j=A.image;if(j===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(j.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{K(G,A,w);return}}e.bindTexture(s.TEXTURE_2D,G.__webglTexture,s.TEXTURE0+w)}function V(A,w){const G=n.get(A);if(A.version>0&&G.__version!==A.version){K(G,A,w);return}e.bindTexture(s.TEXTURE_2D_ARRAY,G.__webglTexture,s.TEXTURE0+w)}function J(A,w){const G=n.get(A);if(A.version>0&&G.__version!==A.version){K(G,A,w);return}e.bindTexture(s.TEXTURE_3D,G.__webglTexture,s.TEXTURE0+w)}function W(A,w){const G=n.get(A);if(A.version>0&&G.__version!==A.version){st(G,A,w);return}e.bindTexture(s.TEXTURE_CUBE_MAP,G.__webglTexture,s.TEXTURE0+w)}const rt={[ln]:s.REPEAT,[Cn]:s.CLAMP_TO_EDGE,[so]:s.MIRRORED_REPEAT},ft={[Ve]:s.NEAREST,[td]:s.NEAREST_MIPMAP_NEAREST,[er]:s.NEAREST_MIPMAP_LINEAR,[Qe]:s.LINEAR,[jr]:s.LINEAR_MIPMAP_NEAREST,[jn]:s.LINEAR_MIPMAP_LINEAR},At={[bf]:s.NEVER,[If]:s.ALWAYS,[Ef]:s.LESS,[pd]:s.LEQUAL,[Af]:s.EQUAL,[Rf]:s.GEQUAL,[Tf]:s.GREATER,[Cf]:s.NOTEQUAL};function Vt(A,w){if(w.type===yn&&t.has("OES_texture_float_linear")===!1&&(w.magFilter===Qe||w.magFilter===jr||w.magFilter===er||w.magFilter===jn||w.minFilter===Qe||w.minFilter===jr||w.minFilter===er||w.minFilter===jn)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(A,s.TEXTURE_WRAP_S,rt[w.wrapS]),s.texParameteri(A,s.TEXTURE_WRAP_T,rt[w.wrapT]),(A===s.TEXTURE_3D||A===s.TEXTURE_2D_ARRAY)&&s.texParameteri(A,s.TEXTURE_WRAP_R,rt[w.wrapR]),s.texParameteri(A,s.TEXTURE_MAG_FILTER,ft[w.magFilter]),s.texParameteri(A,s.TEXTURE_MIN_FILTER,ft[w.minFilter]),w.compareFunction&&(s.texParameteri(A,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(A,s.TEXTURE_COMPARE_FUNC,At[w.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(w.magFilter===Ve||w.minFilter!==er&&w.minFilter!==jn||w.type===yn&&t.has("OES_texture_float_linear")===!1)return;if(w.anisotropy>1||n.get(w).__currentAnisotropy){const G=t.get("EXT_texture_filter_anisotropic");s.texParameterf(A,G.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(w.anisotropy,i.getMaxAnisotropy())),n.get(w).__currentAnisotropy=w.anisotropy}}}function de(A,w){let G=!1;A.__webglInit===void 0&&(A.__webglInit=!0,w.addEventListener("dispose",T));const j=w.source;let tt=u.get(j);tt===void 0&&(tt={},u.set(j,tt));const $=H(w);if($!==A.__cacheKey){tt[$]===void 0&&(tt[$]={texture:s.createTexture(),usedTimes:0},o.memory.textures++,G=!0),tt[$].usedTimes++;const St=tt[A.__cacheKey];St!==void 0&&(tt[A.__cacheKey].usedTimes--,St.usedTimes===0&&S(w)),A.__cacheKey=$,A.__webglTexture=tt[$].texture}return G}function K(A,w,G){let j=s.TEXTURE_2D;(w.isDataArrayTexture||w.isCompressedArrayTexture)&&(j=s.TEXTURE_2D_ARRAY),w.isData3DTexture&&(j=s.TEXTURE_3D);const tt=de(A,w),$=w.source;e.bindTexture(j,A.__webglTexture,s.TEXTURE0+G);const St=n.get($);if($.version!==St.__version||tt===!0){e.activeTexture(s.TEXTURE0+G);const ct=qt.getPrimaries(qt.workingColorSpace),pt=w.colorSpace===Mi?null:qt.getPrimaries(w.colorSpace),Jt=w.colorSpace===Mi||ct===pt?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,w.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,w.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,Jt);let nt=_(w.image,!1,i.maxTextureSize);nt=me(w,nt);const mt=r.convert(w.format,w.colorSpace),Pt=r.convert(w.type);let Dt=M(w.internalFormat,mt,Pt,w.colorSpace,w.isVideoTexture);Vt(j,w);let gt;const jt=w.mipmaps,Ht=w.isVideoTexture!==!0,fe=St.__version===void 0||tt===!0,D=$.dataReady,at=I(w,nt);if(w.isDepthTexture)Dt=v(w.format===Is,w.type),fe&&(Ht?e.texStorage2D(s.TEXTURE_2D,1,Dt,nt.width,nt.height):e.texImage2D(s.TEXTURE_2D,0,Dt,nt.width,nt.height,0,mt,Pt,null));else if(w.isDataTexture)if(jt.length>0){Ht&&fe&&e.texStorage2D(s.TEXTURE_2D,at,Dt,jt[0].width,jt[0].height);for(let q=0,Z=jt.length;q<Z;q++)gt=jt[q],Ht?D&&e.texSubImage2D(s.TEXTURE_2D,q,0,0,gt.width,gt.height,mt,Pt,gt.data):e.texImage2D(s.TEXTURE_2D,q,Dt,gt.width,gt.height,0,mt,Pt,gt.data);w.generateMipmaps=!1}else Ht?(fe&&e.texStorage2D(s.TEXTURE_2D,at,Dt,nt.width,nt.height),D&&e.texSubImage2D(s.TEXTURE_2D,0,0,0,nt.width,nt.height,mt,Pt,nt.data)):e.texImage2D(s.TEXTURE_2D,0,Dt,nt.width,nt.height,0,mt,Pt,nt.data);else if(w.isCompressedTexture)if(w.isCompressedArrayTexture){Ht&&fe&&e.texStorage3D(s.TEXTURE_2D_ARRAY,at,Dt,jt[0].width,jt[0].height,nt.depth);for(let q=0,Z=jt.length;q<Z;q++)if(gt=jt[q],w.format!==cn)if(mt!==null)if(Ht){if(D)if(w.layerUpdates.size>0){const ut=th(gt.width,gt.height,w.format,w.type);for(const ht of w.layerUpdates){const Ft=gt.data.subarray(ht*ut/gt.data.BYTES_PER_ELEMENT,(ht+1)*ut/gt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,q,0,0,ht,gt.width,gt.height,1,mt,Ft)}w.clearLayerUpdates()}else e.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,q,0,0,0,gt.width,gt.height,nt.depth,mt,gt.data)}else e.compressedTexImage3D(s.TEXTURE_2D_ARRAY,q,Dt,gt.width,gt.height,nt.depth,0,gt.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ht?D&&e.texSubImage3D(s.TEXTURE_2D_ARRAY,q,0,0,0,gt.width,gt.height,nt.depth,mt,Pt,gt.data):e.texImage3D(s.TEXTURE_2D_ARRAY,q,Dt,gt.width,gt.height,nt.depth,0,mt,Pt,gt.data)}else{Ht&&fe&&e.texStorage2D(s.TEXTURE_2D,at,Dt,jt[0].width,jt[0].height);for(let q=0,Z=jt.length;q<Z;q++)gt=jt[q],w.format!==cn?mt!==null?Ht?D&&e.compressedTexSubImage2D(s.TEXTURE_2D,q,0,0,gt.width,gt.height,mt,gt.data):e.compressedTexImage2D(s.TEXTURE_2D,q,Dt,gt.width,gt.height,0,gt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ht?D&&e.texSubImage2D(s.TEXTURE_2D,q,0,0,gt.width,gt.height,mt,Pt,gt.data):e.texImage2D(s.TEXTURE_2D,q,Dt,gt.width,gt.height,0,mt,Pt,gt.data)}else if(w.isDataArrayTexture)if(Ht){if(fe&&e.texStorage3D(s.TEXTURE_2D_ARRAY,at,Dt,nt.width,nt.height,nt.depth),D)if(w.layerUpdates.size>0){const q=th(nt.width,nt.height,w.format,w.type);for(const Z of w.layerUpdates){const ut=nt.data.subarray(Z*q/nt.data.BYTES_PER_ELEMENT,(Z+1)*q/nt.data.BYTES_PER_ELEMENT);e.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,Z,nt.width,nt.height,1,mt,Pt,ut)}w.clearLayerUpdates()}else e.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,nt.width,nt.height,nt.depth,mt,Pt,nt.data)}else e.texImage3D(s.TEXTURE_2D_ARRAY,0,Dt,nt.width,nt.height,nt.depth,0,mt,Pt,nt.data);else if(w.isData3DTexture)Ht?(fe&&e.texStorage3D(s.TEXTURE_3D,at,Dt,nt.width,nt.height,nt.depth),D&&e.texSubImage3D(s.TEXTURE_3D,0,0,0,0,nt.width,nt.height,nt.depth,mt,Pt,nt.data)):e.texImage3D(s.TEXTURE_3D,0,Dt,nt.width,nt.height,nt.depth,0,mt,Pt,nt.data);else if(w.isFramebufferTexture){if(fe)if(Ht)e.texStorage2D(s.TEXTURE_2D,at,Dt,nt.width,nt.height);else{let q=nt.width,Z=nt.height;for(let ut=0;ut<at;ut++)e.texImage2D(s.TEXTURE_2D,ut,Dt,q,Z,0,mt,Pt,null),q>>=1,Z>>=1}}else if(jt.length>0){if(Ht&&fe){const q=Ct(jt[0]);e.texStorage2D(s.TEXTURE_2D,at,Dt,q.width,q.height)}for(let q=0,Z=jt.length;q<Z;q++)gt=jt[q],Ht?D&&e.texSubImage2D(s.TEXTURE_2D,q,0,0,mt,Pt,gt):e.texImage2D(s.TEXTURE_2D,q,Dt,mt,Pt,gt);w.generateMipmaps=!1}else if(Ht){if(fe){const q=Ct(nt);e.texStorage2D(s.TEXTURE_2D,at,Dt,q.width,q.height)}D&&e.texSubImage2D(s.TEXTURE_2D,0,0,0,mt,Pt,nt)}else e.texImage2D(s.TEXTURE_2D,0,Dt,mt,Pt,nt);m(w)&&p(j),St.__version=$.version,w.onUpdate&&w.onUpdate(w)}A.__version=w.version}function st(A,w,G){if(w.image.length!==6)return;const j=de(A,w),tt=w.source;e.bindTexture(s.TEXTURE_CUBE_MAP,A.__webglTexture,s.TEXTURE0+G);const $=n.get(tt);if(tt.version!==$.__version||j===!0){e.activeTexture(s.TEXTURE0+G);const St=qt.getPrimaries(qt.workingColorSpace),ct=w.colorSpace===Mi?null:qt.getPrimaries(w.colorSpace),pt=w.colorSpace===Mi||St===ct?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,w.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,w.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,w.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,pt);const Jt=w.isCompressedTexture||w.image[0].isCompressedTexture,nt=w.image[0]&&w.image[0].isDataTexture,mt=[];for(let Z=0;Z<6;Z++)!Jt&&!nt?mt[Z]=_(w.image[Z],!0,i.maxCubemapSize):mt[Z]=nt?w.image[Z].image:w.image[Z],mt[Z]=me(w,mt[Z]);const Pt=mt[0],Dt=r.convert(w.format,w.colorSpace),gt=r.convert(w.type),jt=M(w.internalFormat,Dt,gt,w.colorSpace),Ht=w.isVideoTexture!==!0,fe=$.__version===void 0||j===!0,D=tt.dataReady;let at=I(w,Pt);Vt(s.TEXTURE_CUBE_MAP,w);let q;if(Jt){Ht&&fe&&e.texStorage2D(s.TEXTURE_CUBE_MAP,at,jt,Pt.width,Pt.height);for(let Z=0;Z<6;Z++){q=mt[Z].mipmaps;for(let ut=0;ut<q.length;ut++){const ht=q[ut];w.format!==cn?Dt!==null?Ht?D&&e.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Z,ut,0,0,ht.width,ht.height,Dt,ht.data):e.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Z,ut,jt,ht.width,ht.height,0,ht.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):Ht?D&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Z,ut,0,0,ht.width,ht.height,Dt,gt,ht.data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Z,ut,jt,ht.width,ht.height,0,Dt,gt,ht.data)}}}else{if(q=w.mipmaps,Ht&&fe){q.length>0&&at++;const Z=Ct(mt[0]);e.texStorage2D(s.TEXTURE_CUBE_MAP,at,jt,Z.width,Z.height)}for(let Z=0;Z<6;Z++)if(nt){Ht?D&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,0,0,mt[Z].width,mt[Z].height,Dt,gt,mt[Z].data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,jt,mt[Z].width,mt[Z].height,0,Dt,gt,mt[Z].data);for(let ut=0;ut<q.length;ut++){const Ft=q[ut].image[Z].image;Ht?D&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Z,ut+1,0,0,Ft.width,Ft.height,Dt,gt,Ft.data):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Z,ut+1,jt,Ft.width,Ft.height,0,Dt,gt,Ft.data)}}else{Ht?D&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,0,0,Dt,gt,mt[Z]):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,jt,Dt,gt,mt[Z]);for(let ut=0;ut<q.length;ut++){const ht=q[ut];Ht?D&&e.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Z,ut+1,0,0,Dt,gt,ht.image[Z]):e.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+Z,ut+1,jt,Dt,gt,ht.image[Z])}}}m(w)&&p(s.TEXTURE_CUBE_MAP),$.__version=tt.version,w.onUpdate&&w.onUpdate(w)}A.__version=w.version}function Mt(A,w,G,j,tt,$){const St=r.convert(G.format,G.colorSpace),ct=r.convert(G.type),pt=M(G.internalFormat,St,ct,G.colorSpace),Jt=n.get(w),nt=n.get(G);if(nt.__renderTarget=w,!Jt.__hasExternalTextures){const mt=Math.max(1,w.width>>$),Pt=Math.max(1,w.height>>$);tt===s.TEXTURE_3D||tt===s.TEXTURE_2D_ARRAY?e.texImage3D(tt,$,pt,mt,Pt,w.depth,0,St,ct,null):e.texImage2D(tt,$,pt,mt,Pt,0,St,ct,null)}e.bindFramebuffer(s.FRAMEBUFFER,A),Kt(w)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,j,tt,nt.__webglTexture,0,$t(w)):(tt===s.TEXTURE_2D||tt>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&tt<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,j,tt,nt.__webglTexture,$),e.bindFramebuffer(s.FRAMEBUFFER,null)}function lt(A,w,G){if(s.bindRenderbuffer(s.RENDERBUFFER,A),w.depthBuffer){const j=w.depthTexture,tt=j&&j.isDepthTexture?j.type:null,$=v(w.stencilBuffer,tt),St=w.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,ct=$t(w);Kt(w)?a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,ct,$,w.width,w.height):G?s.renderbufferStorageMultisample(s.RENDERBUFFER,ct,$,w.width,w.height):s.renderbufferStorage(s.RENDERBUFFER,$,w.width,w.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,St,s.RENDERBUFFER,A)}else{const j=w.textures;for(let tt=0;tt<j.length;tt++){const $=j[tt],St=r.convert($.format,$.colorSpace),ct=r.convert($.type),pt=M($.internalFormat,St,ct,$.colorSpace),Jt=$t(w);G&&Kt(w)===!1?s.renderbufferStorageMultisample(s.RENDERBUFFER,Jt,pt,w.width,w.height):Kt(w)?a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,Jt,pt,w.width,w.height):s.renderbufferStorage(s.RENDERBUFFER,pt,w.width,w.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function Lt(A,w){if(w&&w.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(s.FRAMEBUFFER,A),!(w.depthTexture&&w.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const j=n.get(w.depthTexture);j.__renderTarget=w,(!j.__webglTexture||w.depthTexture.image.width!==w.width||w.depthTexture.image.height!==w.height)&&(w.depthTexture.image.width=w.width,w.depthTexture.image.height=w.height,w.depthTexture.needsUpdate=!0),z(w.depthTexture,0);const tt=j.__webglTexture,$=$t(w);if(w.depthTexture.format===xs)Kt(w)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,tt,0,$):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,tt,0);else if(w.depthTexture.format===Is)Kt(w)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,tt,0,$):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,tt,0);else throw new Error("Unknown depthTexture format")}function Ut(A){const w=n.get(A),G=A.isWebGLCubeRenderTarget===!0;if(w.__boundDepthTexture!==A.depthTexture){const j=A.depthTexture;if(w.__depthDisposeCallback&&w.__depthDisposeCallback(),j){const tt=()=>{delete w.__boundDepthTexture,delete w.__depthDisposeCallback,j.removeEventListener("dispose",tt)};j.addEventListener("dispose",tt),w.__depthDisposeCallback=tt}w.__boundDepthTexture=j}if(A.depthTexture&&!w.__autoAllocateDepthBuffer){if(G)throw new Error("target.depthTexture not supported in Cube render targets");Lt(w.__webglFramebuffer,A)}else if(G){w.__webglDepthbuffer=[];for(let j=0;j<6;j++)if(e.bindFramebuffer(s.FRAMEBUFFER,w.__webglFramebuffer[j]),w.__webglDepthbuffer[j]===void 0)w.__webglDepthbuffer[j]=s.createRenderbuffer(),lt(w.__webglDepthbuffer[j],A,!1);else{const tt=A.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,$=w.__webglDepthbuffer[j];s.bindRenderbuffer(s.RENDERBUFFER,$),s.framebufferRenderbuffer(s.FRAMEBUFFER,tt,s.RENDERBUFFER,$)}}else if(e.bindFramebuffer(s.FRAMEBUFFER,w.__webglFramebuffer),w.__webglDepthbuffer===void 0)w.__webglDepthbuffer=s.createRenderbuffer(),lt(w.__webglDepthbuffer,A,!1);else{const j=A.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,tt=w.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,tt),s.framebufferRenderbuffer(s.FRAMEBUFFER,j,s.RENDERBUFFER,tt)}e.bindFramebuffer(s.FRAMEBUFFER,null)}function Wt(A,w,G){const j=n.get(A);w!==void 0&&Mt(j.__webglFramebuffer,A,A.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),G!==void 0&&Ut(A)}function ye(A){const w=A.texture,G=n.get(A),j=n.get(w);A.addEventListener("dispose",E);const tt=A.textures,$=A.isWebGLCubeRenderTarget===!0,St=tt.length>1;if(St||(j.__webglTexture===void 0&&(j.__webglTexture=s.createTexture()),j.__version=w.version,o.memory.textures++),$){G.__webglFramebuffer=[];for(let ct=0;ct<6;ct++)if(w.mipmaps&&w.mipmaps.length>0){G.__webglFramebuffer[ct]=[];for(let pt=0;pt<w.mipmaps.length;pt++)G.__webglFramebuffer[ct][pt]=s.createFramebuffer()}else G.__webglFramebuffer[ct]=s.createFramebuffer()}else{if(w.mipmaps&&w.mipmaps.length>0){G.__webglFramebuffer=[];for(let ct=0;ct<w.mipmaps.length;ct++)G.__webglFramebuffer[ct]=s.createFramebuffer()}else G.__webglFramebuffer=s.createFramebuffer();if(St)for(let ct=0,pt=tt.length;ct<pt;ct++){const Jt=n.get(tt[ct]);Jt.__webglTexture===void 0&&(Jt.__webglTexture=s.createTexture(),o.memory.textures++)}if(A.samples>0&&Kt(A)===!1){G.__webglMultisampledFramebuffer=s.createFramebuffer(),G.__webglColorRenderbuffer=[],e.bindFramebuffer(s.FRAMEBUFFER,G.__webglMultisampledFramebuffer);for(let ct=0;ct<tt.length;ct++){const pt=tt[ct];G.__webglColorRenderbuffer[ct]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,G.__webglColorRenderbuffer[ct]);const Jt=r.convert(pt.format,pt.colorSpace),nt=r.convert(pt.type),mt=M(pt.internalFormat,Jt,nt,pt.colorSpace,A.isXRRenderTarget===!0),Pt=$t(A);s.renderbufferStorageMultisample(s.RENDERBUFFER,Pt,mt,A.width,A.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+ct,s.RENDERBUFFER,G.__webglColorRenderbuffer[ct])}s.bindRenderbuffer(s.RENDERBUFFER,null),A.depthBuffer&&(G.__webglDepthRenderbuffer=s.createRenderbuffer(),lt(G.__webglDepthRenderbuffer,A,!0)),e.bindFramebuffer(s.FRAMEBUFFER,null)}}if($){e.bindTexture(s.TEXTURE_CUBE_MAP,j.__webglTexture),Vt(s.TEXTURE_CUBE_MAP,w);for(let ct=0;ct<6;ct++)if(w.mipmaps&&w.mipmaps.length>0)for(let pt=0;pt<w.mipmaps.length;pt++)Mt(G.__webglFramebuffer[ct][pt],A,w,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+ct,pt);else Mt(G.__webglFramebuffer[ct],A,w,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+ct,0);m(w)&&p(s.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(St){for(let ct=0,pt=tt.length;ct<pt;ct++){const Jt=tt[ct],nt=n.get(Jt);e.bindTexture(s.TEXTURE_2D,nt.__webglTexture),Vt(s.TEXTURE_2D,Jt),Mt(G.__webglFramebuffer,A,Jt,s.COLOR_ATTACHMENT0+ct,s.TEXTURE_2D,0),m(Jt)&&p(s.TEXTURE_2D)}e.unbindTexture()}else{let ct=s.TEXTURE_2D;if((A.isWebGL3DRenderTarget||A.isWebGLArrayRenderTarget)&&(ct=A.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),e.bindTexture(ct,j.__webglTexture),Vt(ct,w),w.mipmaps&&w.mipmaps.length>0)for(let pt=0;pt<w.mipmaps.length;pt++)Mt(G.__webglFramebuffer[pt],A,w,s.COLOR_ATTACHMENT0,ct,pt);else Mt(G.__webglFramebuffer,A,w,s.COLOR_ATTACHMENT0,ct,0);m(w)&&p(ct),e.unbindTexture()}A.depthBuffer&&Ut(A)}function Zt(A){const w=A.textures;for(let G=0,j=w.length;G<j;G++){const tt=w[G];if(m(tt)){const $=y(A),St=n.get(tt).__webglTexture;e.bindTexture($,St),p($),e.unbindTexture()}}}const we=[],O=[];function en(A){if(A.samples>0){if(Kt(A)===!1){const w=A.textures,G=A.width,j=A.height;let tt=s.COLOR_BUFFER_BIT;const $=A.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,St=n.get(A),ct=w.length>1;if(ct)for(let pt=0;pt<w.length;pt++)e.bindFramebuffer(s.FRAMEBUFFER,St.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+pt,s.RENDERBUFFER,null),e.bindFramebuffer(s.FRAMEBUFFER,St.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+pt,s.TEXTURE_2D,null,0);e.bindFramebuffer(s.READ_FRAMEBUFFER,St.__webglMultisampledFramebuffer),e.bindFramebuffer(s.DRAW_FRAMEBUFFER,St.__webglFramebuffer);for(let pt=0;pt<w.length;pt++){if(A.resolveDepthBuffer&&(A.depthBuffer&&(tt|=s.DEPTH_BUFFER_BIT),A.stencilBuffer&&A.resolveStencilBuffer&&(tt|=s.STENCIL_BUFFER_BIT)),ct){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,St.__webglColorRenderbuffer[pt]);const Jt=n.get(w[pt]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,Jt,0)}s.blitFramebuffer(0,0,G,j,0,0,G,j,tt,s.NEAREST),l===!0&&(we.length=0,O.length=0,we.push(s.COLOR_ATTACHMENT0+pt),A.depthBuffer&&A.resolveDepthBuffer===!1&&(we.push($),O.push($),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,O)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,we))}if(e.bindFramebuffer(s.READ_FRAMEBUFFER,null),e.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),ct)for(let pt=0;pt<w.length;pt++){e.bindFramebuffer(s.FRAMEBUFFER,St.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+pt,s.RENDERBUFFER,St.__webglColorRenderbuffer[pt]);const Jt=n.get(w[pt]).__webglTexture;e.bindFramebuffer(s.FRAMEBUFFER,St.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+pt,s.TEXTURE_2D,Jt,0)}e.bindFramebuffer(s.DRAW_FRAMEBUFFER,St.__webglMultisampledFramebuffer)}else if(A.depthBuffer&&A.resolveDepthBuffer===!1&&l){const w=A.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[w])}}}function $t(A){return Math.min(i.maxSamples,A.samples)}function Kt(A){const w=n.get(A);return A.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&w.__useRenderToTexture!==!1}function Rt(A){const w=o.render.frame;h.get(A)!==w&&(h.set(A,w),A.update())}function me(A,w){const G=A.colorSpace,j=A.format,tt=A.type;return A.isCompressedTexture===!0||A.isVideoTexture===!0||G!==Ye&&G!==Mi&&(qt.getTransfer(G)===ce?(j!==cn||tt!==ei)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",G)),w}function Ct(A){return typeof HTMLImageElement<"u"&&A instanceof HTMLImageElement?(c.width=A.naturalWidth||A.width,c.height=A.naturalHeight||A.height):typeof VideoFrame<"u"&&A instanceof VideoFrame?(c.width=A.displayWidth,c.height=A.displayHeight):(c.width=A.width,c.height=A.height),c}this.allocateTextureUnit=N,this.resetTextureUnits=F,this.setTexture2D=z,this.setTexture2DArray=V,this.setTexture3D=J,this.setTextureCube=W,this.rebindTextures=Wt,this.setupRenderTarget=ye,this.updateRenderTargetMipmap=Zt,this.updateMultisampleRenderTarget=en,this.setupDepthRenderbuffer=Ut,this.setupFrameBufferTexture=Mt,this.useMultisampledRTT=Kt}function j_(s,t){function e(n,i=Mi){let r;const o=qt.getTransfer(i);if(n===ei)return s.UNSIGNED_BYTE;if(n===vl)return s.UNSIGNED_SHORT_4_4_4_4;if(n===xl)return s.UNSIGNED_SHORT_5_5_5_1;if(n===id)return s.UNSIGNED_INT_5_9_9_9_REV;if(n===ed)return s.BYTE;if(n===nd)return s.SHORT;if(n===lr)return s.UNSIGNED_SHORT;if(n===_l)return s.INT;if(n===qi)return s.UNSIGNED_INT;if(n===yn)return s.FLOAT;if(n===fr)return s.HALF_FLOAT;if(n===sd)return s.ALPHA;if(n===rd)return s.RGB;if(n===cn)return s.RGBA;if(n===od)return s.LUMINANCE;if(n===ad)return s.LUMINANCE_ALPHA;if(n===xs)return s.DEPTH_COMPONENT;if(n===Is)return s.DEPTH_STENCIL;if(n===yl)return s.RED;if(n===Ml)return s.RED_INTEGER;if(n===ld)return s.RG;if(n===Sl)return s.RG_INTEGER;if(n===wl)return s.RGBA_INTEGER;if(n===Zr||n===Jr||n===Qr||n===to)if(o===ce)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Zr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Jr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Qr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===to)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Zr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Jr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Qr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===to)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Ca||n===Ra||n===Ia||n===Pa)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Ca)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Ra)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Ia)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Pa)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===La||n===Da||n===Na)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===La||n===Da)return o===ce?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Na)return o===ce?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===Ua||n===ka||n===Fa||n===Oa||n===Ba||n===Ha||n===Ga||n===za||n===Va||n===Wa||n===Xa||n===Ya||n===qa||n===$a)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Ua)return o===ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===ka)return o===ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Fa)return o===ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Oa)return o===ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Ba)return o===ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Ha)return o===ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Ga)return o===ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===za)return o===ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Va)return o===ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Wa)return o===ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Xa)return o===ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Ya)return o===ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===qa)return o===ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===$a)return o===ce?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===eo||n===Ka||n===ja)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===eo)return o===ce?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Ka)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===ja)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===cd||n===Za||n===Ja||n===Qa)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===eo)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Za)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Ja)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Qa)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Rs?s.UNSIGNED_INT_24_8:s[n]!==void 0?s[n]:null}return{convert:e}}class Z_ extends Ke{constructor(t=[]){super(),this.isArrayCamera=!0,this.cameras=t}}class Tt extends ve{constructor(){super(),this.isGroup=!0,this.type="Group"}}const J_={type:"move"};class na{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Tt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Tt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new L,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new L),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Tt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new L,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new L),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){const e=this._hand;if(e)for(const n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let i=null,r=null,o=null;const a=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){o=!0;for(const _ of t.hand.values()){const m=e.getJointPose(_,n),p=this._getHandJoint(c,_);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}const h=c.joints["index-finger-tip"],d=c.joints["thumb-tip"],u=h.position.distanceTo(d.position),f=.02,g=.005;c.inputState.pinching&&u>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&u<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(i=e.getPose(t.targetRaySpace,n),i===null&&r!==null&&(i=r),i!==null&&(a.matrix.fromArray(i.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,i.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(i.linearVelocity)):a.hasLinearVelocity=!1,i.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(i.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(J_)))}return a!==null&&(a.visible=i!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){const n=new Tt;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}}const Q_=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,tv=`
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

}`;class ev{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e,n){if(this.texture===null){const i=new Te,r=t.properties.get(i);r.__webglTexture=e.texture,(e.depthNear!=n.depthNear||e.depthFar!=n.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=i}}getMesh(t){if(this.texture!==null&&this.mesh===null){const e=t.cameras[0].viewport,n=new Ii({vertexShader:Q_,fragmentShader:tv,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new R(new Xe(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class nv extends Ki{constructor(t,e){super();const n=this;let i=null,r=1,o=null,a="local-floor",l=1,c=null,h=null,d=null,u=null,f=null,g=null;const _=new ev,m=e.getContextAttributes();let p=null,y=null;const M=[],v=[],I=new zt;let T=null;const E=new Ke;E.viewport=new ee;const C=new Ke;C.viewport=new ee;const S=[E,C],x=new Z_;let P=null,F=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(K){let st=M[K];return st===void 0&&(st=new na,M[K]=st),st.getTargetRaySpace()},this.getControllerGrip=function(K){let st=M[K];return st===void 0&&(st=new na,M[K]=st),st.getGripSpace()},this.getHand=function(K){let st=M[K];return st===void 0&&(st=new na,M[K]=st),st.getHandSpace()};function N(K){const st=v.indexOf(K.inputSource);if(st===-1)return;const Mt=M[st];Mt!==void 0&&(Mt.update(K.inputSource,K.frame,c||o),Mt.dispatchEvent({type:K.type,data:K.inputSource}))}function H(){i.removeEventListener("select",N),i.removeEventListener("selectstart",N),i.removeEventListener("selectend",N),i.removeEventListener("squeeze",N),i.removeEventListener("squeezestart",N),i.removeEventListener("squeezeend",N),i.removeEventListener("end",H),i.removeEventListener("inputsourceschange",z);for(let K=0;K<M.length;K++){const st=v[K];st!==null&&(v[K]=null,M[K].disconnect(st))}P=null,F=null,_.reset(),t.setRenderTarget(p),f=null,u=null,d=null,i=null,y=null,de.stop(),n.isPresenting=!1,t.setPixelRatio(T),t.setSize(I.width,I.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(K){r=K,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(K){a=K,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(K){c=K},this.getBaseLayer=function(){return u!==null?u:f},this.getBinding=function(){return d},this.getFrame=function(){return g},this.getSession=function(){return i},this.setSession=async function(K){if(i=K,i!==null){if(p=t.getRenderTarget(),i.addEventListener("select",N),i.addEventListener("selectstart",N),i.addEventListener("selectend",N),i.addEventListener("squeeze",N),i.addEventListener("squeezestart",N),i.addEventListener("squeezeend",N),i.addEventListener("end",H),i.addEventListener("inputsourceschange",z),m.xrCompatible!==!0&&await e.makeXRCompatible(),T=t.getPixelRatio(),t.getSize(I),i.renderState.layers===void 0){const st={antialias:m.antialias,alpha:!0,depth:m.depth,stencil:m.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(i,e,st),i.updateRenderState({baseLayer:f}),t.setPixelRatio(1),t.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new $i(f.framebufferWidth,f.framebufferHeight,{format:cn,type:ei,colorSpace:t.outputColorSpace,stencilBuffer:m.stencil})}else{let st=null,Mt=null,lt=null;m.depth&&(lt=m.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,st=m.stencil?Is:xs,Mt=m.stencil?Rs:qi);const Lt={colorFormat:e.RGBA8,depthFormat:lt,scaleFactor:r};d=new XRWebGLBinding(i,e),u=d.createProjectionLayer(Lt),i.updateRenderState({layers:[u]}),t.setPixelRatio(1),t.setSize(u.textureWidth,u.textureHeight,!1),y=new $i(u.textureWidth,u.textureHeight,{format:cn,type:ei,depthTexture:new Ed(u.textureWidth,u.textureHeight,Mt,void 0,void 0,void 0,void 0,void 0,void 0,st),stencilBuffer:m.stencil,colorSpace:t.outputColorSpace,samples:m.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await i.requestReferenceSpace(a),de.setContext(i),de.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return _.getDepthTexture()};function z(K){for(let st=0;st<K.removed.length;st++){const Mt=K.removed[st],lt=v.indexOf(Mt);lt>=0&&(v[lt]=null,M[lt].disconnect(Mt))}for(let st=0;st<K.added.length;st++){const Mt=K.added[st];let lt=v.indexOf(Mt);if(lt===-1){for(let Ut=0;Ut<M.length;Ut++)if(Ut>=v.length){v.push(Mt),lt=Ut;break}else if(v[Ut]===null){v[Ut]=Mt,lt=Ut;break}if(lt===-1)break}const Lt=M[lt];Lt&&Lt.connect(Mt)}}const V=new L,J=new L;function W(K,st,Mt){V.setFromMatrixPosition(st.matrixWorld),J.setFromMatrixPosition(Mt.matrixWorld);const lt=V.distanceTo(J),Lt=st.projectionMatrix.elements,Ut=Mt.projectionMatrix.elements,Wt=Lt[14]/(Lt[10]-1),ye=Lt[14]/(Lt[10]+1),Zt=(Lt[9]+1)/Lt[5],we=(Lt[9]-1)/Lt[5],O=(Lt[8]-1)/Lt[0],en=(Ut[8]+1)/Ut[0],$t=Wt*O,Kt=Wt*en,Rt=lt/(-O+en),me=Rt*-O;if(st.matrixWorld.decompose(K.position,K.quaternion,K.scale),K.translateX(me),K.translateZ(Rt),K.matrixWorld.compose(K.position,K.quaternion,K.scale),K.matrixWorldInverse.copy(K.matrixWorld).invert(),Lt[10]===-1)K.projectionMatrix.copy(st.projectionMatrix),K.projectionMatrixInverse.copy(st.projectionMatrixInverse);else{const Ct=Wt+Rt,A=ye+Rt,w=$t-me,G=Kt+(lt-me),j=Zt*ye/A*Ct,tt=we*ye/A*Ct;K.projectionMatrix.makePerspective(w,G,j,tt,Ct,A),K.projectionMatrixInverse.copy(K.projectionMatrix).invert()}}function rt(K,st){st===null?K.matrixWorld.copy(K.matrix):K.matrixWorld.multiplyMatrices(st.matrixWorld,K.matrix),K.matrixWorldInverse.copy(K.matrixWorld).invert()}this.updateCamera=function(K){if(i===null)return;let st=K.near,Mt=K.far;_.texture!==null&&(_.depthNear>0&&(st=_.depthNear),_.depthFar>0&&(Mt=_.depthFar)),x.near=C.near=E.near=st,x.far=C.far=E.far=Mt,(P!==x.near||F!==x.far)&&(i.updateRenderState({depthNear:x.near,depthFar:x.far}),P=x.near,F=x.far),E.layers.mask=K.layers.mask|2,C.layers.mask=K.layers.mask|4,x.layers.mask=E.layers.mask|C.layers.mask;const lt=K.parent,Lt=x.cameras;rt(x,lt);for(let Ut=0;Ut<Lt.length;Ut++)rt(Lt[Ut],lt);Lt.length===2?W(x,E,C):x.projectionMatrix.copy(E.projectionMatrix),ft(K,x,lt)};function ft(K,st,Mt){Mt===null?K.matrix.copy(st.matrixWorld):(K.matrix.copy(Mt.matrixWorld),K.matrix.invert(),K.matrix.multiply(st.matrixWorld)),K.matrix.decompose(K.position,K.quaternion,K.scale),K.updateMatrixWorld(!0),K.projectionMatrix.copy(st.projectionMatrix),K.projectionMatrixInverse.copy(st.projectionMatrixInverse),K.isPerspectiveCamera&&(K.fov=Ps*2*Math.atan(1/K.projectionMatrix.elements[5]),K.zoom=1)}this.getCamera=function(){return x},this.getFoveation=function(){if(!(u===null&&f===null))return l},this.setFoveation=function(K){l=K,u!==null&&(u.fixedFoveation=K),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=K)},this.hasDepthSensing=function(){return _.texture!==null},this.getDepthSensingMesh=function(){return _.getMesh(x)};let At=null;function Vt(K,st){if(h=st.getViewerPose(c||o),g=st,h!==null){const Mt=h.views;f!==null&&(t.setRenderTargetFramebuffer(y,f.framebuffer),t.setRenderTarget(y));let lt=!1;Mt.length!==x.cameras.length&&(x.cameras.length=0,lt=!0);for(let Ut=0;Ut<Mt.length;Ut++){const Wt=Mt[Ut];let ye=null;if(f!==null)ye=f.getViewport(Wt);else{const we=d.getViewSubImage(u,Wt);ye=we.viewport,Ut===0&&(t.setRenderTargetTextures(y,we.colorTexture,u.ignoreDepthValues?void 0:we.depthStencilTexture),t.setRenderTarget(y))}let Zt=S[Ut];Zt===void 0&&(Zt=new Ke,Zt.layers.enable(Ut),Zt.viewport=new ee,S[Ut]=Zt),Zt.matrix.fromArray(Wt.transform.matrix),Zt.matrix.decompose(Zt.position,Zt.quaternion,Zt.scale),Zt.projectionMatrix.fromArray(Wt.projectionMatrix),Zt.projectionMatrixInverse.copy(Zt.projectionMatrix).invert(),Zt.viewport.set(ye.x,ye.y,ye.width,ye.height),Ut===0&&(x.matrix.copy(Zt.matrix),x.matrix.decompose(x.position,x.quaternion,x.scale)),lt===!0&&x.cameras.push(Zt)}const Lt=i.enabledFeatures;if(Lt&&Lt.includes("depth-sensing")){const Ut=d.getDepthInformation(Mt[0]);Ut&&Ut.isValid&&Ut.texture&&_.init(t,Ut,i.renderState)}}for(let Mt=0;Mt<M.length;Mt++){const lt=v[Mt],Lt=M[Mt];lt!==null&&Lt!==void 0&&Lt.update(lt,st,c||o)}At&&At(K,st),st.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:st}),g=null}const de=new bd;de.setAnimationLoop(Vt),this.setAnimationLoop=function(K){At=K},this.dispose=function(){}}}const Fi=new Pn,iv=new kt;function sv(s,t){function e(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,Md(s)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function i(m,p,y,M,v){p.isMeshBasicMaterial||p.isMeshLambertMaterial?r(m,p):p.isMeshToonMaterial?(r(m,p),d(m,p)):p.isMeshPhongMaterial?(r(m,p),h(m,p)):p.isMeshStandardMaterial?(r(m,p),u(m,p),p.isMeshPhysicalMaterial&&f(m,p,v)):p.isMeshMatcapMaterial?(r(m,p),g(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),_(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(o(m,p),p.isLineDashedMaterial&&a(m,p)):p.isPointsMaterial?l(m,p,y,M):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,e(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,e(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===ze&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,e(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===ze&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,e(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,e(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,e(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);const y=t.get(p),M=y.envMap,v=y.envMapRotation;M&&(m.envMap.value=M,Fi.copy(v),Fi.x*=-1,Fi.y*=-1,Fi.z*=-1,M.isCubeTexture&&M.isRenderTargetTexture===!1&&(Fi.y*=-1,Fi.z*=-1),m.envMapRotation.value.setFromMatrix4(iv.makeRotationFromEuler(Fi)),m.flipEnvMap.value=M.isCubeTexture&&M.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,e(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,e(p.aoMap,m.aoMapTransform))}function o(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,e(p.map,m.mapTransform))}function a(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,y,M){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*y,m.scale.value=M*.5,p.map&&(m.map.value=p.map,e(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,e(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function h(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function d(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function u(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,e(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,e(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,y){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,e(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,e(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,e(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,e(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,e(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===ze&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,e(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,e(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=y.texture,m.transmissionSamplerSize.value.set(y.width,y.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,e(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,e(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,e(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,e(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,e(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function _(m,p){const y=t.get(p).light;m.referencePosition.value.setFromMatrixPosition(y.matrixWorld),m.nearDistance.value=y.shadow.camera.near,m.farDistance.value=y.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function rv(s,t,e,n){let i={},r={},o=[];const a=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function l(y,M){const v=M.program;n.uniformBlockBinding(y,v)}function c(y,M){let v=i[y.id];v===void 0&&(g(y),v=h(y),i[y.id]=v,y.addEventListener("dispose",m));const I=M.program;n.updateUBOMapping(y,I);const T=t.render.frame;r[y.id]!==T&&(u(y),r[y.id]=T)}function h(y){const M=d();y.__bindingPointIndex=M;const v=s.createBuffer(),I=y.__size,T=y.usage;return s.bindBuffer(s.UNIFORM_BUFFER,v),s.bufferData(s.UNIFORM_BUFFER,I,T),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,M,v),v}function d(){for(let y=0;y<a;y++)if(o.indexOf(y)===-1)return o.push(y),y;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(y){const M=i[y.id],v=y.uniforms,I=y.__cache;s.bindBuffer(s.UNIFORM_BUFFER,M);for(let T=0,E=v.length;T<E;T++){const C=Array.isArray(v[T])?v[T]:[v[T]];for(let S=0,x=C.length;S<x;S++){const P=C[S];if(f(P,T,S,I)===!0){const F=P.__offset,N=Array.isArray(P.value)?P.value:[P.value];let H=0;for(let z=0;z<N.length;z++){const V=N[z],J=_(V);typeof V=="number"||typeof V=="boolean"?(P.__data[0]=V,s.bufferSubData(s.UNIFORM_BUFFER,F+H,P.__data)):V.isMatrix3?(P.__data[0]=V.elements[0],P.__data[1]=V.elements[1],P.__data[2]=V.elements[2],P.__data[3]=0,P.__data[4]=V.elements[3],P.__data[5]=V.elements[4],P.__data[6]=V.elements[5],P.__data[7]=0,P.__data[8]=V.elements[6],P.__data[9]=V.elements[7],P.__data[10]=V.elements[8],P.__data[11]=0):(V.toArray(P.__data,H),H+=J.storage/Float32Array.BYTES_PER_ELEMENT)}s.bufferSubData(s.UNIFORM_BUFFER,F,P.__data)}}}s.bindBuffer(s.UNIFORM_BUFFER,null)}function f(y,M,v,I){const T=y.value,E=M+"_"+v;if(I[E]===void 0)return typeof T=="number"||typeof T=="boolean"?I[E]=T:I[E]=T.clone(),!0;{const C=I[E];if(typeof T=="number"||typeof T=="boolean"){if(C!==T)return I[E]=T,!0}else if(C.equals(T)===!1)return C.copy(T),!0}return!1}function g(y){const M=y.uniforms;let v=0;const I=16;for(let E=0,C=M.length;E<C;E++){const S=Array.isArray(M[E])?M[E]:[M[E]];for(let x=0,P=S.length;x<P;x++){const F=S[x],N=Array.isArray(F.value)?F.value:[F.value];for(let H=0,z=N.length;H<z;H++){const V=N[H],J=_(V),W=v%I,rt=W%J.boundary,ft=W+rt;v+=rt,ft!==0&&I-ft<J.storage&&(v+=I-ft),F.__data=new Float32Array(J.storage/Float32Array.BYTES_PER_ELEMENT),F.__offset=v,v+=J.storage}}}const T=v%I;return T>0&&(v+=I-T),y.__size=v,y.__cache={},this}function _(y){const M={boundary:0,storage:0};return typeof y=="number"||typeof y=="boolean"?(M.boundary=4,M.storage=4):y.isVector2?(M.boundary=8,M.storage=8):y.isVector3||y.isColor?(M.boundary=16,M.storage=12):y.isVector4?(M.boundary=16,M.storage=16):y.isMatrix3?(M.boundary=48,M.storage=48):y.isMatrix4?(M.boundary=64,M.storage=64):y.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",y),M}function m(y){const M=y.target;M.removeEventListener("dispose",m);const v=o.indexOf(M.__bindingPointIndex);o.splice(v,1),s.deleteBuffer(i[M.id]),delete i[M.id],delete r[M.id]}function p(){for(const y in i)s.deleteBuffer(i[y]);o=[],i={},r={}}return{bind:l,update:c,dispose:p}}class ov{constructor(t={}){const{canvas:e=$f(),context:n=null,depth:i=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:d=!1,reverseDepthBuffer:u=!1}=t;this.isWebGLRenderer=!0;let f;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=n.getContextAttributes().alpha}else f=o;const g=new Uint32Array(4),_=new Int32Array(4);let m=null,p=null;const y=[],M=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this._outputColorSpace=be,this.toneMapping=Ti,this.toneMappingExposure=1;const v=this;let I=!1,T=0,E=0,C=null,S=-1,x=null;const P=new ee,F=new ee;let N=null;const H=new It(0);let z=0,V=e.width,J=e.height,W=1,rt=null,ft=null;const At=new ee(0,0,V,J),Vt=new ee(0,0,V,J);let de=!1;const K=new Tl;let st=!1,Mt=!1;const lt=new kt,Lt=new kt,Ut=new L,Wt=new ee,ye={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Zt=!1;function we(){return C===null?W:1}let O=n;function en(b,U){return e.getContext(b,U)}try{const b={alpha:!0,depth:i,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:d};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${gl}`),e.addEventListener("webglcontextlost",Z,!1),e.addEventListener("webglcontextrestored",ut,!1),e.addEventListener("webglcontextcreationerror",ht,!1),O===null){const U="webgl2";if(O=en(U,b),O===null)throw en(U)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(b){throw console.error("THREE.WebGLRenderer: "+b.message),b}let $t,Kt,Rt,me,Ct,A,w,G,j,tt,$,St,ct,pt,Jt,nt,mt,Pt,Dt,gt,jt,Ht,fe,D;function at(){$t=new d0(O),$t.init(),Ht=new j_(O,$t),Kt=new r0(O,$t,t,Ht),Rt=new q_(O,$t),Kt.reverseDepthBuffer&&u&&Rt.buffers.depth.setReversed(!0),me=new p0(O),Ct=new L_,A=new K_(O,$t,Rt,Ct,Kt,Ht,me),w=new a0(v),G=new h0(v),j=new Mp(O),fe=new i0(O,j),tt=new u0(O,j,me,fe),$=new g0(O,tt,j,me),Dt=new m0(O,Kt,A),nt=new o0(Ct),St=new P_(v,w,G,$t,Kt,fe,nt),ct=new sv(v,Ct),pt=new N_,Jt=new H_($t),Pt=new n0(v,w,G,Rt,$,f,l),mt=new X_(v,$,Kt),D=new rv(O,me,Kt,Rt),gt=new s0(O,$t,me),jt=new f0(O,$t,me),me.programs=St.programs,v.capabilities=Kt,v.extensions=$t,v.properties=Ct,v.renderLists=pt,v.shadowMap=mt,v.state=Rt,v.info=me}at();const q=new nv(v,O);this.xr=q,this.getContext=function(){return O},this.getContextAttributes=function(){return O.getContextAttributes()},this.forceContextLoss=function(){const b=$t.get("WEBGL_lose_context");b&&b.loseContext()},this.forceContextRestore=function(){const b=$t.get("WEBGL_lose_context");b&&b.restoreContext()},this.getPixelRatio=function(){return W},this.setPixelRatio=function(b){b!==void 0&&(W=b,this.setSize(V,J,!1))},this.getSize=function(b){return b.set(V,J)},this.setSize=function(b,U,X=!0){if(q.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}V=b,J=U,e.width=Math.floor(b*W),e.height=Math.floor(U*W),X===!0&&(e.style.width=b+"px",e.style.height=U+"px"),this.setViewport(0,0,b,U)},this.getDrawingBufferSize=function(b){return b.set(V*W,J*W).floor()},this.setDrawingBufferSize=function(b,U,X){V=b,J=U,W=X,e.width=Math.floor(b*X),e.height=Math.floor(U*X),this.setViewport(0,0,b,U)},this.getCurrentViewport=function(b){return b.copy(P)},this.getViewport=function(b){return b.copy(At)},this.setViewport=function(b,U,X,Y){b.isVector4?At.set(b.x,b.y,b.z,b.w):At.set(b,U,X,Y),Rt.viewport(P.copy(At).multiplyScalar(W).round())},this.getScissor=function(b){return b.copy(Vt)},this.setScissor=function(b,U,X,Y){b.isVector4?Vt.set(b.x,b.y,b.z,b.w):Vt.set(b,U,X,Y),Rt.scissor(F.copy(Vt).multiplyScalar(W).round())},this.getScissorTest=function(){return de},this.setScissorTest=function(b){Rt.setScissorTest(de=b)},this.setOpaqueSort=function(b){rt=b},this.setTransparentSort=function(b){ft=b},this.getClearColor=function(b){return b.copy(Pt.getClearColor())},this.setClearColor=function(){Pt.setClearColor.apply(Pt,arguments)},this.getClearAlpha=function(){return Pt.getClearAlpha()},this.setClearAlpha=function(){Pt.setClearAlpha.apply(Pt,arguments)},this.clear=function(b=!0,U=!0,X=!0){let Y=0;if(b){let k=!1;if(C!==null){const it=C.texture.format;k=it===wl||it===Sl||it===Ml}if(k){const it=C.texture.type,dt=it===ei||it===qi||it===lr||it===Rs||it===vl||it===xl,vt=Pt.getClearColor(),xt=Pt.getClearAlpha(),Nt=vt.r,Ot=vt.g,yt=vt.b;dt?(g[0]=Nt,g[1]=Ot,g[2]=yt,g[3]=xt,O.clearBufferuiv(O.COLOR,0,g)):(_[0]=Nt,_[1]=Ot,_[2]=yt,_[3]=xt,O.clearBufferiv(O.COLOR,0,_))}else Y|=O.COLOR_BUFFER_BIT}U&&(Y|=O.DEPTH_BUFFER_BIT),X&&(Y|=O.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),O.clear(Y)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",Z,!1),e.removeEventListener("webglcontextrestored",ut,!1),e.removeEventListener("webglcontextcreationerror",ht,!1),pt.dispose(),Jt.dispose(),Ct.dispose(),w.dispose(),G.dispose(),$.dispose(),fe.dispose(),D.dispose(),St.dispose(),q.dispose(),q.removeEventListener("sessionstart",zl),q.removeEventListener("sessionend",Vl),Pi.stop()};function Z(b){b.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),I=!0}function ut(){console.log("THREE.WebGLRenderer: Context Restored."),I=!1;const b=me.autoReset,U=mt.enabled,X=mt.autoUpdate,Y=mt.needsUpdate,k=mt.type;at(),me.autoReset=b,mt.enabled=U,mt.autoUpdate=X,mt.needsUpdate=Y,mt.type=k}function ht(b){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",b.statusMessage)}function Ft(b){const U=b.target;U.removeEventListener("dispose",Ft),Me(U)}function Me(b){De(b),Ct.remove(b)}function De(b){const U=Ct.get(b).programs;U!==void 0&&(U.forEach(function(X){St.releaseProgram(X)}),b.isShaderMaterial&&St.releaseShaderCache(b))}this.renderBufferDirect=function(b,U,X,Y,k,it){U===null&&(U=ye);const dt=k.isMesh&&k.matrixWorld.determinant()<0,vt=eu(b,U,X,Y,k);Rt.setMaterial(Y,dt);let xt=X.index,Nt=1;if(Y.wireframe===!0){if(xt=tt.getWireframeAttribute(X),xt===void 0)return;Nt=2}const Ot=X.drawRange,yt=X.attributes.position;let Qt=Ot.start*Nt,pe=(Ot.start+Ot.count)*Nt;it!==null&&(Qt=Math.max(Qt,it.start*Nt),pe=Math.min(pe,(it.start+it.count)*Nt)),xt!==null?(Qt=Math.max(Qt,0),pe=Math.min(pe,xt.count)):yt!=null&&(Qt=Math.max(Qt,0),pe=Math.min(pe,yt.count));const ge=pe-Qt;if(ge<0||ge===1/0)return;fe.setup(k,Y,vt,X,xt);let $e,ne=gt;if(xt!==null&&($e=j.get(xt),ne=jt,ne.setIndex($e)),k.isMesh)Y.wireframe===!0?(Rt.setLineWidth(Y.wireframeLinewidth*we()),ne.setMode(O.LINES)):ne.setMode(O.TRIANGLES);else if(k.isLine){let wt=Y.linewidth;wt===void 0&&(wt=1),Rt.setLineWidth(wt*we()),k.isLineSegments?ne.setMode(O.LINES):k.isLineLoop?ne.setMode(O.LINE_LOOP):ne.setMode(O.LINE_STRIP)}else k.isPoints?ne.setMode(O.POINTS):k.isSprite&&ne.setMode(O.TRIANGLES);if(k.isBatchedMesh)if(k._multiDrawInstances!==null)ne.renderMultiDrawInstances(k._multiDrawStarts,k._multiDrawCounts,k._multiDrawCount,k._multiDrawInstances);else if($t.get("WEBGL_multi_draw"))ne.renderMultiDraw(k._multiDrawStarts,k._multiDrawCounts,k._multiDrawCount);else{const wt=k._multiDrawStarts,Fn=k._multiDrawCounts,ie=k._multiDrawCount,un=xt?j.get(xt).bytesPerElement:1,ji=Ct.get(Y).currentProgram.getUniforms();for(let je=0;je<ie;je++)ji.setValue(O,"_gl_DrawID",je),ne.render(wt[je]/un,Fn[je])}else if(k.isInstancedMesh)ne.renderInstances(Qt,ge,k.count);else if(X.isInstancedBufferGeometry){const wt=X._maxInstanceCount!==void 0?X._maxInstanceCount:1/0,Fn=Math.min(X.instanceCount,wt);ne.renderInstances(Qt,ge,Fn)}else ne.render(Qt,ge)};function re(b,U,X){b.transparent===!0&&b.side===oe&&b.forceSinglePass===!1?(b.side=ze,b.needsUpdate=!0,xr(b,U,X),b.side=ti,b.needsUpdate=!0,xr(b,U,X),b.side=oe):xr(b,U,X)}this.compile=function(b,U,X=null){X===null&&(X=b),p=Jt.get(X),p.init(U),M.push(p),X.traverseVisible(function(k){k.isLight&&k.layers.test(U.layers)&&(p.pushLight(k),k.castShadow&&p.pushShadow(k))}),b!==X&&b.traverseVisible(function(k){k.isLight&&k.layers.test(U.layers)&&(p.pushLight(k),k.castShadow&&p.pushShadow(k))}),p.setupLights();const Y=new Set;return b.traverse(function(k){if(!(k.isMesh||k.isPoints||k.isLine||k.isSprite))return;const it=k.material;if(it)if(Array.isArray(it))for(let dt=0;dt<it.length;dt++){const vt=it[dt];re(vt,X,k),Y.add(vt)}else re(it,X,k),Y.add(it)}),M.pop(),p=null,Y},this.compileAsync=function(b,U,X=null){const Y=this.compile(b,U,X);return new Promise(k=>{function it(){if(Y.forEach(function(dt){Ct.get(dt).currentProgram.isReady()&&Y.delete(dt)}),Y.size===0){k(b);return}setTimeout(it,10)}$t.get("KHR_parallel_shader_compile")!==null?it():setTimeout(it,10)})};let dn=null;function kn(b){dn&&dn(b)}function zl(){Pi.stop()}function Vl(){Pi.start()}const Pi=new bd;Pi.setAnimationLoop(kn),typeof self<"u"&&Pi.setContext(self),this.setAnimationLoop=function(b){dn=b,q.setAnimationLoop(b),b===null?Pi.stop():Pi.start()},q.addEventListener("sessionstart",zl),q.addEventListener("sessionend",Vl),this.render=function(b,U){if(U!==void 0&&U.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(I===!0)return;if(b.matrixWorldAutoUpdate===!0&&b.updateMatrixWorld(),U.parent===null&&U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),q.enabled===!0&&q.isPresenting===!0&&(q.cameraAutoUpdate===!0&&q.updateCamera(U),U=q.getCamera()),b.isScene===!0&&b.onBeforeRender(v,b,U,C),p=Jt.get(b,M.length),p.init(U),M.push(p),Lt.multiplyMatrices(U.projectionMatrix,U.matrixWorldInverse),K.setFromProjectionMatrix(Lt),Mt=this.localClippingEnabled,st=nt.init(this.clippingPlanes,Mt),m=pt.get(b,y.length),m.init(),y.push(m),q.enabled===!0&&q.isPresenting===!0){const it=v.xr.getDepthSensingMesh();it!==null&&Ao(it,U,-1/0,v.sortObjects)}Ao(b,U,0,v.sortObjects),m.finish(),v.sortObjects===!0&&m.sort(rt,ft),Zt=q.enabled===!1||q.isPresenting===!1||q.hasDepthSensing()===!1,Zt&&Pt.addToRenderList(m,b),this.info.render.frame++,st===!0&&nt.beginShadows();const X=p.state.shadowsArray;mt.render(X,b,U),st===!0&&nt.endShadows(),this.info.autoReset===!0&&this.info.reset();const Y=m.opaque,k=m.transmissive;if(p.setupLights(),U.isArrayCamera){const it=U.cameras;if(k.length>0)for(let dt=0,vt=it.length;dt<vt;dt++){const xt=it[dt];Xl(Y,k,b,xt)}Zt&&Pt.render(b);for(let dt=0,vt=it.length;dt<vt;dt++){const xt=it[dt];Wl(m,b,xt,xt.viewport)}}else k.length>0&&Xl(Y,k,b,U),Zt&&Pt.render(b),Wl(m,b,U);C!==null&&(A.updateMultisampleRenderTarget(C),A.updateRenderTargetMipmap(C)),b.isScene===!0&&b.onAfterRender(v,b,U),fe.resetDefaultState(),S=-1,x=null,M.pop(),M.length>0?(p=M[M.length-1],st===!0&&nt.setGlobalState(v.clippingPlanes,p.state.camera)):p=null,y.pop(),y.length>0?m=y[y.length-1]:m=null};function Ao(b,U,X,Y){if(b.visible===!1)return;if(b.layers.test(U.layers)){if(b.isGroup)X=b.renderOrder;else if(b.isLOD)b.autoUpdate===!0&&b.update(U);else if(b.isLight)p.pushLight(b),b.castShadow&&p.pushShadow(b);else if(b.isSprite){if(!b.frustumCulled||K.intersectsSprite(b)){Y&&Wt.setFromMatrixPosition(b.matrixWorld).applyMatrix4(Lt);const dt=$.update(b),vt=b.material;vt.visible&&m.push(b,dt,vt,X,Wt.z,null)}}else if((b.isMesh||b.isLine||b.isPoints)&&(!b.frustumCulled||K.intersectsObject(b))){const dt=$.update(b),vt=b.material;if(Y&&(b.boundingSphere!==void 0?(b.boundingSphere===null&&b.computeBoundingSphere(),Wt.copy(b.boundingSphere.center)):(dt.boundingSphere===null&&dt.computeBoundingSphere(),Wt.copy(dt.boundingSphere.center)),Wt.applyMatrix4(b.matrixWorld).applyMatrix4(Lt)),Array.isArray(vt)){const xt=dt.groups;for(let Nt=0,Ot=xt.length;Nt<Ot;Nt++){const yt=xt[Nt],Qt=vt[yt.materialIndex];Qt&&Qt.visible&&m.push(b,dt,Qt,X,Wt.z,yt)}}else vt.visible&&m.push(b,dt,vt,X,Wt.z,null)}}const it=b.children;for(let dt=0,vt=it.length;dt<vt;dt++)Ao(it[dt],U,X,Y)}function Wl(b,U,X,Y){const k=b.opaque,it=b.transmissive,dt=b.transparent;p.setupLightsView(X),st===!0&&nt.setGlobalState(v.clippingPlanes,X),Y&&Rt.viewport(P.copy(Y)),k.length>0&&vr(k,U,X),it.length>0&&vr(it,U,X),dt.length>0&&vr(dt,U,X),Rt.buffers.depth.setTest(!0),Rt.buffers.depth.setMask(!0),Rt.buffers.color.setMask(!0),Rt.setPolygonOffset(!1)}function Xl(b,U,X,Y){if((X.isScene===!0?X.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[Y.id]===void 0&&(p.state.transmissionRenderTarget[Y.id]=new $i(1,1,{generateMipmaps:!0,type:$t.has("EXT_color_buffer_half_float")||$t.has("EXT_color_buffer_float")?fr:ei,minFilter:jn,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:qt.workingColorSpace}));const it=p.state.transmissionRenderTarget[Y.id],dt=Y.viewport||P;it.setSize(dt.z,dt.w);const vt=v.getRenderTarget();v.setRenderTarget(it),v.getClearColor(H),z=v.getClearAlpha(),z<1&&v.setClearColor(16777215,.5),v.clear(),Zt&&Pt.render(X);const xt=v.toneMapping;v.toneMapping=Ti;const Nt=Y.viewport;if(Y.viewport!==void 0&&(Y.viewport=void 0),p.setupLightsView(Y),st===!0&&nt.setGlobalState(v.clippingPlanes,Y),vr(b,X,Y),A.updateMultisampleRenderTarget(it),A.updateRenderTargetMipmap(it),$t.has("WEBGL_multisampled_render_to_texture")===!1){let Ot=!1;for(let yt=0,Qt=U.length;yt<Qt;yt++){const pe=U[yt],ge=pe.object,$e=pe.geometry,ne=pe.material,wt=pe.group;if(ne.side===oe&&ge.layers.test(Y.layers)){const Fn=ne.side;ne.side=ze,ne.needsUpdate=!0,Yl(ge,X,Y,$e,ne,wt),ne.side=Fn,ne.needsUpdate=!0,Ot=!0}}Ot===!0&&(A.updateMultisampleRenderTarget(it),A.updateRenderTargetMipmap(it))}v.setRenderTarget(vt),v.setClearColor(H,z),Nt!==void 0&&(Y.viewport=Nt),v.toneMapping=xt}function vr(b,U,X){const Y=U.isScene===!0?U.overrideMaterial:null;for(let k=0,it=b.length;k<it;k++){const dt=b[k],vt=dt.object,xt=dt.geometry,Nt=Y===null?dt.material:Y,Ot=dt.group;vt.layers.test(X.layers)&&Yl(vt,U,X,xt,Nt,Ot)}}function Yl(b,U,X,Y,k,it){b.onBeforeRender(v,U,X,Y,k,it),b.modelViewMatrix.multiplyMatrices(X.matrixWorldInverse,b.matrixWorld),b.normalMatrix.getNormalMatrix(b.modelViewMatrix),k.onBeforeRender(v,U,X,Y,b,it),k.transparent===!0&&k.side===oe&&k.forceSinglePass===!1?(k.side=ze,k.needsUpdate=!0,v.renderBufferDirect(X,U,Y,k,b,it),k.side=ti,k.needsUpdate=!0,v.renderBufferDirect(X,U,Y,k,b,it),k.side=oe):v.renderBufferDirect(X,U,Y,k,b,it),b.onAfterRender(v,U,X,Y,k,it)}function xr(b,U,X){U.isScene!==!0&&(U=ye);const Y=Ct.get(b),k=p.state.lights,it=p.state.shadowsArray,dt=k.state.version,vt=St.getParameters(b,k.state,it,U,X),xt=St.getProgramCacheKey(vt);let Nt=Y.programs;Y.environment=b.isMeshStandardMaterial?U.environment:null,Y.fog=U.fog,Y.envMap=(b.isMeshStandardMaterial?G:w).get(b.envMap||Y.environment),Y.envMapRotation=Y.environment!==null&&b.envMap===null?U.environmentRotation:b.envMapRotation,Nt===void 0&&(b.addEventListener("dispose",Ft),Nt=new Map,Y.programs=Nt);let Ot=Nt.get(xt);if(Ot!==void 0){if(Y.currentProgram===Ot&&Y.lightsStateVersion===dt)return $l(b,vt),Ot}else vt.uniforms=St.getUniforms(b),b.onBeforeCompile(vt,v),Ot=St.acquireProgram(vt,xt),Nt.set(xt,Ot),Y.uniforms=vt.uniforms;const yt=Y.uniforms;return(!b.isShaderMaterial&&!b.isRawShaderMaterial||b.clipping===!0)&&(yt.clippingPlanes=nt.uniform),$l(b,vt),Y.needsLights=iu(b),Y.lightsStateVersion=dt,Y.needsLights&&(yt.ambientLightColor.value=k.state.ambient,yt.lightProbe.value=k.state.probe,yt.directionalLights.value=k.state.directional,yt.directionalLightShadows.value=k.state.directionalShadow,yt.spotLights.value=k.state.spot,yt.spotLightShadows.value=k.state.spotShadow,yt.rectAreaLights.value=k.state.rectArea,yt.ltc_1.value=k.state.rectAreaLTC1,yt.ltc_2.value=k.state.rectAreaLTC2,yt.pointLights.value=k.state.point,yt.pointLightShadows.value=k.state.pointShadow,yt.hemisphereLights.value=k.state.hemi,yt.directionalShadowMap.value=k.state.directionalShadowMap,yt.directionalShadowMatrix.value=k.state.directionalShadowMatrix,yt.spotShadowMap.value=k.state.spotShadowMap,yt.spotLightMatrix.value=k.state.spotLightMatrix,yt.spotLightMap.value=k.state.spotLightMap,yt.pointShadowMap.value=k.state.pointShadowMap,yt.pointShadowMatrix.value=k.state.pointShadowMatrix),Y.currentProgram=Ot,Y.uniformsList=null,Ot}function ql(b){if(b.uniformsList===null){const U=b.currentProgram.getUniforms();b.uniformsList=no.seqWithValue(U.seq,b.uniforms)}return b.uniformsList}function $l(b,U){const X=Ct.get(b);X.outputColorSpace=U.outputColorSpace,X.batching=U.batching,X.batchingColor=U.batchingColor,X.instancing=U.instancing,X.instancingColor=U.instancingColor,X.instancingMorph=U.instancingMorph,X.skinning=U.skinning,X.morphTargets=U.morphTargets,X.morphNormals=U.morphNormals,X.morphColors=U.morphColors,X.morphTargetsCount=U.morphTargetsCount,X.numClippingPlanes=U.numClippingPlanes,X.numIntersection=U.numClipIntersection,X.vertexAlphas=U.vertexAlphas,X.vertexTangents=U.vertexTangents,X.toneMapping=U.toneMapping}function eu(b,U,X,Y,k){U.isScene!==!0&&(U=ye),A.resetTextureUnits();const it=U.fog,dt=Y.isMeshStandardMaterial?U.environment:null,vt=C===null?v.outputColorSpace:C.isXRRenderTarget===!0?C.texture.colorSpace:Ye,xt=(Y.isMeshStandardMaterial?G:w).get(Y.envMap||dt),Nt=Y.vertexColors===!0&&!!X.attributes.color&&X.attributes.color.itemSize===4,Ot=!!X.attributes.tangent&&(!!Y.normalMap||Y.anisotropy>0),yt=!!X.morphAttributes.position,Qt=!!X.morphAttributes.normal,pe=!!X.morphAttributes.color;let ge=Ti;Y.toneMapped&&(C===null||C.isXRRenderTarget===!0)&&(ge=v.toneMapping);const $e=X.morphAttributes.position||X.morphAttributes.normal||X.morphAttributes.color,ne=$e!==void 0?$e.length:0,wt=Ct.get(Y),Fn=p.state.lights;if(st===!0&&(Mt===!0||b!==x)){const nn=b===x&&Y.id===S;nt.setState(Y,b,nn)}let ie=!1;Y.version===wt.__version?(wt.needsLights&&wt.lightsStateVersion!==Fn.state.version||wt.outputColorSpace!==vt||k.isBatchedMesh&&wt.batching===!1||!k.isBatchedMesh&&wt.batching===!0||k.isBatchedMesh&&wt.batchingColor===!0&&k.colorTexture===null||k.isBatchedMesh&&wt.batchingColor===!1&&k.colorTexture!==null||k.isInstancedMesh&&wt.instancing===!1||!k.isInstancedMesh&&wt.instancing===!0||k.isSkinnedMesh&&wt.skinning===!1||!k.isSkinnedMesh&&wt.skinning===!0||k.isInstancedMesh&&wt.instancingColor===!0&&k.instanceColor===null||k.isInstancedMesh&&wt.instancingColor===!1&&k.instanceColor!==null||k.isInstancedMesh&&wt.instancingMorph===!0&&k.morphTexture===null||k.isInstancedMesh&&wt.instancingMorph===!1&&k.morphTexture!==null||wt.envMap!==xt||Y.fog===!0&&wt.fog!==it||wt.numClippingPlanes!==void 0&&(wt.numClippingPlanes!==nt.numPlanes||wt.numIntersection!==nt.numIntersection)||wt.vertexAlphas!==Nt||wt.vertexTangents!==Ot||wt.morphTargets!==yt||wt.morphNormals!==Qt||wt.morphColors!==pe||wt.toneMapping!==ge||wt.morphTargetsCount!==ne)&&(ie=!0):(ie=!0,wt.__version=Y.version);let un=wt.currentProgram;ie===!0&&(un=xr(Y,U,k));let ji=!1,je=!1,Gs=!1;const _e=un.getUniforms(),bn=wt.uniforms;if(Rt.useProgram(un.program)&&(ji=!0,je=!0,Gs=!0),Y.id!==S&&(S=Y.id,je=!0),ji||x!==b){Rt.buffers.depth.getReversed()?(lt.copy(b.projectionMatrix),jf(lt),Zf(lt),_e.setValue(O,"projectionMatrix",lt)):_e.setValue(O,"projectionMatrix",b.projectionMatrix),_e.setValue(O,"viewMatrix",b.matrixWorldInverse);const ai=_e.map.cameraPosition;ai!==void 0&&ai.setValue(O,Ut.setFromMatrixPosition(b.matrixWorld)),Kt.logarithmicDepthBuffer&&_e.setValue(O,"logDepthBufFC",2/(Math.log(b.far+1)/Math.LN2)),(Y.isMeshPhongMaterial||Y.isMeshToonMaterial||Y.isMeshLambertMaterial||Y.isMeshBasicMaterial||Y.isMeshStandardMaterial||Y.isShaderMaterial)&&_e.setValue(O,"isOrthographic",b.isOrthographicCamera===!0),x!==b&&(x=b,je=!0,Gs=!0)}if(k.isSkinnedMesh){_e.setOptional(O,k,"bindMatrix"),_e.setOptional(O,k,"bindMatrixInverse");const nn=k.skeleton;nn&&(nn.boneTexture===null&&nn.computeBoneTexture(),_e.setValue(O,"boneTexture",nn.boneTexture,A))}k.isBatchedMesh&&(_e.setOptional(O,k,"batchingTexture"),_e.setValue(O,"batchingTexture",k._matricesTexture,A),_e.setOptional(O,k,"batchingIdTexture"),_e.setValue(O,"batchingIdTexture",k._indirectTexture,A),_e.setOptional(O,k,"batchingColorTexture"),k._colorsTexture!==null&&_e.setValue(O,"batchingColorTexture",k._colorsTexture,A));const zs=X.morphAttributes;if((zs.position!==void 0||zs.normal!==void 0||zs.color!==void 0)&&Dt.update(k,X,un),(je||wt.receiveShadow!==k.receiveShadow)&&(wt.receiveShadow=k.receiveShadow,_e.setValue(O,"receiveShadow",k.receiveShadow)),Y.isMeshGouraudMaterial&&Y.envMap!==null&&(bn.envMap.value=xt,bn.flipEnvMap.value=xt.isCubeTexture&&xt.isRenderTargetTexture===!1?-1:1),Y.isMeshStandardMaterial&&Y.envMap===null&&U.environment!==null&&(bn.envMapIntensity.value=U.environmentIntensity),je&&(_e.setValue(O,"toneMappingExposure",v.toneMappingExposure),wt.needsLights&&nu(bn,Gs),it&&Y.fog===!0&&ct.refreshFogUniforms(bn,it),ct.refreshMaterialUniforms(bn,Y,W,J,p.state.transmissionRenderTarget[b.id]),no.upload(O,ql(wt),bn,A)),Y.isShaderMaterial&&Y.uniformsNeedUpdate===!0&&(no.upload(O,ql(wt),bn,A),Y.uniformsNeedUpdate=!1),Y.isSpriteMaterial&&_e.setValue(O,"center",k.center),_e.setValue(O,"modelViewMatrix",k.modelViewMatrix),_e.setValue(O,"normalMatrix",k.normalMatrix),_e.setValue(O,"modelMatrix",k.matrixWorld),Y.isShaderMaterial||Y.isRawShaderMaterial){const nn=Y.uniformsGroups;for(let ai=0,li=nn.length;ai<li;ai++){const Kl=nn[ai];D.update(Kl,un),D.bind(Kl,un)}}return un}function nu(b,U){b.ambientLightColor.needsUpdate=U,b.lightProbe.needsUpdate=U,b.directionalLights.needsUpdate=U,b.directionalLightShadows.needsUpdate=U,b.pointLights.needsUpdate=U,b.pointLightShadows.needsUpdate=U,b.spotLights.needsUpdate=U,b.spotLightShadows.needsUpdate=U,b.rectAreaLights.needsUpdate=U,b.hemisphereLights.needsUpdate=U}function iu(b){return b.isMeshLambertMaterial||b.isMeshToonMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isShadowMaterial||b.isShaderMaterial&&b.lights===!0}this.getActiveCubeFace=function(){return T},this.getActiveMipmapLevel=function(){return E},this.getRenderTarget=function(){return C},this.setRenderTargetTextures=function(b,U,X){Ct.get(b.texture).__webglTexture=U,Ct.get(b.depthTexture).__webglTexture=X;const Y=Ct.get(b);Y.__hasExternalTextures=!0,Y.__autoAllocateDepthBuffer=X===void 0,Y.__autoAllocateDepthBuffer||$t.has("WEBGL_multisampled_render_to_texture")===!0&&(console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"),Y.__useRenderToTexture=!1)},this.setRenderTargetFramebuffer=function(b,U){const X=Ct.get(b);X.__webglFramebuffer=U,X.__useDefaultFramebuffer=U===void 0},this.setRenderTarget=function(b,U=0,X=0){C=b,T=U,E=X;let Y=!0,k=null,it=!1,dt=!1;if(b){const xt=Ct.get(b);if(xt.__useDefaultFramebuffer!==void 0)Rt.bindFramebuffer(O.FRAMEBUFFER,null),Y=!1;else if(xt.__webglFramebuffer===void 0)A.setupRenderTarget(b);else if(xt.__hasExternalTextures)A.rebindTextures(b,Ct.get(b.texture).__webglTexture,Ct.get(b.depthTexture).__webglTexture);else if(b.depthBuffer){const yt=b.depthTexture;if(xt.__boundDepthTexture!==yt){if(yt!==null&&Ct.has(yt)&&(b.width!==yt.image.width||b.height!==yt.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");A.setupDepthRenderbuffer(b)}}const Nt=b.texture;(Nt.isData3DTexture||Nt.isDataArrayTexture||Nt.isCompressedArrayTexture)&&(dt=!0);const Ot=Ct.get(b).__webglFramebuffer;b.isWebGLCubeRenderTarget?(Array.isArray(Ot[U])?k=Ot[U][X]:k=Ot[U],it=!0):b.samples>0&&A.useMultisampledRTT(b)===!1?k=Ct.get(b).__webglMultisampledFramebuffer:Array.isArray(Ot)?k=Ot[X]:k=Ot,P.copy(b.viewport),F.copy(b.scissor),N=b.scissorTest}else P.copy(At).multiplyScalar(W).floor(),F.copy(Vt).multiplyScalar(W).floor(),N=de;if(Rt.bindFramebuffer(O.FRAMEBUFFER,k)&&Y&&Rt.drawBuffers(b,k),Rt.viewport(P),Rt.scissor(F),Rt.setScissorTest(N),it){const xt=Ct.get(b.texture);O.framebufferTexture2D(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_CUBE_MAP_POSITIVE_X+U,xt.__webglTexture,X)}else if(dt){const xt=Ct.get(b.texture),Nt=U||0;O.framebufferTextureLayer(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0,xt.__webglTexture,X||0,Nt)}S=-1},this.readRenderTargetPixels=function(b,U,X,Y,k,it,dt){if(!(b&&b.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let vt=Ct.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&dt!==void 0&&(vt=vt[dt]),vt){Rt.bindFramebuffer(O.FRAMEBUFFER,vt);try{const xt=b.texture,Nt=xt.format,Ot=xt.type;if(!Kt.textureFormatReadable(Nt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Kt.textureTypeReadable(Ot)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}U>=0&&U<=b.width-Y&&X>=0&&X<=b.height-k&&O.readPixels(U,X,Y,k,Ht.convert(Nt),Ht.convert(Ot),it)}finally{const xt=C!==null?Ct.get(C).__webglFramebuffer:null;Rt.bindFramebuffer(O.FRAMEBUFFER,xt)}}},this.readRenderTargetPixelsAsync=async function(b,U,X,Y,k,it,dt){if(!(b&&b.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let vt=Ct.get(b).__webglFramebuffer;if(b.isWebGLCubeRenderTarget&&dt!==void 0&&(vt=vt[dt]),vt){const xt=b.texture,Nt=xt.format,Ot=xt.type;if(!Kt.textureFormatReadable(Nt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Kt.textureTypeReadable(Ot))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");if(U>=0&&U<=b.width-Y&&X>=0&&X<=b.height-k){Rt.bindFramebuffer(O.FRAMEBUFFER,vt);const yt=O.createBuffer();O.bindBuffer(O.PIXEL_PACK_BUFFER,yt),O.bufferData(O.PIXEL_PACK_BUFFER,it.byteLength,O.STREAM_READ),O.readPixels(U,X,Y,k,Ht.convert(Nt),Ht.convert(Ot),0);const Qt=C!==null?Ct.get(C).__webglFramebuffer:null;Rt.bindFramebuffer(O.FRAMEBUFFER,Qt);const pe=O.fenceSync(O.SYNC_GPU_COMMANDS_COMPLETE,0);return O.flush(),await Kf(O,pe,4),O.bindBuffer(O.PIXEL_PACK_BUFFER,yt),O.getBufferSubData(O.PIXEL_PACK_BUFFER,0,it),O.deleteBuffer(yt),O.deleteSync(pe),it}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")}},this.copyFramebufferToTexture=function(b,U=null,X=0){b.isTexture!==!0&&(nr("WebGLRenderer: copyFramebufferToTexture function signature has changed."),U=arguments[0]||null,b=arguments[1]);const Y=Math.pow(2,-X),k=Math.floor(b.image.width*Y),it=Math.floor(b.image.height*Y),dt=U!==null?U.x:0,vt=U!==null?U.y:0;A.setTexture2D(b,0),O.copyTexSubImage2D(O.TEXTURE_2D,X,0,0,dt,vt,k,it),Rt.unbindTexture()},this.copyTextureToTexture=function(b,U,X=null,Y=null,k=0){b.isTexture!==!0&&(nr("WebGLRenderer: copyTextureToTexture function signature has changed."),Y=arguments[0]||null,b=arguments[1],U=arguments[2],k=arguments[3]||0,X=null);let it,dt,vt,xt,Nt,Ot,yt,Qt,pe;const ge=b.isCompressedTexture?b.mipmaps[k]:b.image;X!==null?(it=X.max.x-X.min.x,dt=X.max.y-X.min.y,vt=X.isBox3?X.max.z-X.min.z:1,xt=X.min.x,Nt=X.min.y,Ot=X.isBox3?X.min.z:0):(it=ge.width,dt=ge.height,vt=ge.depth||1,xt=0,Nt=0,Ot=0),Y!==null?(yt=Y.x,Qt=Y.y,pe=Y.z):(yt=0,Qt=0,pe=0);const $e=Ht.convert(U.format),ne=Ht.convert(U.type);let wt;U.isData3DTexture?(A.setTexture3D(U,0),wt=O.TEXTURE_3D):U.isDataArrayTexture||U.isCompressedArrayTexture?(A.setTexture2DArray(U,0),wt=O.TEXTURE_2D_ARRAY):(A.setTexture2D(U,0),wt=O.TEXTURE_2D),O.pixelStorei(O.UNPACK_FLIP_Y_WEBGL,U.flipY),O.pixelStorei(O.UNPACK_PREMULTIPLY_ALPHA_WEBGL,U.premultiplyAlpha),O.pixelStorei(O.UNPACK_ALIGNMENT,U.unpackAlignment);const Fn=O.getParameter(O.UNPACK_ROW_LENGTH),ie=O.getParameter(O.UNPACK_IMAGE_HEIGHT),un=O.getParameter(O.UNPACK_SKIP_PIXELS),ji=O.getParameter(O.UNPACK_SKIP_ROWS),je=O.getParameter(O.UNPACK_SKIP_IMAGES);O.pixelStorei(O.UNPACK_ROW_LENGTH,ge.width),O.pixelStorei(O.UNPACK_IMAGE_HEIGHT,ge.height),O.pixelStorei(O.UNPACK_SKIP_PIXELS,xt),O.pixelStorei(O.UNPACK_SKIP_ROWS,Nt),O.pixelStorei(O.UNPACK_SKIP_IMAGES,Ot);const Gs=b.isDataArrayTexture||b.isData3DTexture,_e=U.isDataArrayTexture||U.isData3DTexture;if(b.isRenderTargetTexture||b.isDepthTexture){const bn=Ct.get(b),zs=Ct.get(U),nn=Ct.get(bn.__renderTarget),ai=Ct.get(zs.__renderTarget);Rt.bindFramebuffer(O.READ_FRAMEBUFFER,nn.__webglFramebuffer),Rt.bindFramebuffer(O.DRAW_FRAMEBUFFER,ai.__webglFramebuffer);for(let li=0;li<vt;li++)Gs&&O.framebufferTextureLayer(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,Ct.get(b).__webglTexture,k,Ot+li),b.isDepthTexture?(_e&&O.framebufferTextureLayer(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,Ct.get(U).__webglTexture,k,pe+li),O.blitFramebuffer(xt,Nt,it,dt,yt,Qt,it,dt,O.DEPTH_BUFFER_BIT,O.NEAREST)):_e?O.copyTexSubImage3D(wt,k,yt,Qt,pe+li,xt,Nt,it,dt):O.copyTexSubImage2D(wt,k,yt,Qt,pe+li,xt,Nt,it,dt);Rt.bindFramebuffer(O.READ_FRAMEBUFFER,null),Rt.bindFramebuffer(O.DRAW_FRAMEBUFFER,null)}else _e?b.isDataTexture||b.isData3DTexture?O.texSubImage3D(wt,k,yt,Qt,pe,it,dt,vt,$e,ne,ge.data):U.isCompressedArrayTexture?O.compressedTexSubImage3D(wt,k,yt,Qt,pe,it,dt,vt,$e,ge.data):O.texSubImage3D(wt,k,yt,Qt,pe,it,dt,vt,$e,ne,ge):b.isDataTexture?O.texSubImage2D(O.TEXTURE_2D,k,yt,Qt,it,dt,$e,ne,ge.data):b.isCompressedTexture?O.compressedTexSubImage2D(O.TEXTURE_2D,k,yt,Qt,ge.width,ge.height,$e,ge.data):O.texSubImage2D(O.TEXTURE_2D,k,yt,Qt,it,dt,$e,ne,ge);O.pixelStorei(O.UNPACK_ROW_LENGTH,Fn),O.pixelStorei(O.UNPACK_IMAGE_HEIGHT,ie),O.pixelStorei(O.UNPACK_SKIP_PIXELS,un),O.pixelStorei(O.UNPACK_SKIP_ROWS,ji),O.pixelStorei(O.UNPACK_SKIP_IMAGES,je),k===0&&U.generateMipmaps&&O.generateMipmap(wt),Rt.unbindTexture()},this.copyTextureToTexture3D=function(b,U,X=null,Y=null,k=0){return b.isTexture!==!0&&(nr("WebGLRenderer: copyTextureToTexture3D function signature has changed."),X=arguments[0]||null,Y=arguments[1]||null,b=arguments[2],U=arguments[3],k=arguments[4]||0),nr('WebGLRenderer: copyTextureToTexture3D function has been deprecated. Use "copyTextureToTexture" instead.'),this.copyTextureToTexture(b,U,X,Y,k)},this.initRenderTarget=function(b){Ct.get(b).__webglFramebuffer===void 0&&A.setupRenderTarget(b)},this.initTexture=function(b){b.isCubeTexture?A.setTextureCube(b,0):b.isData3DTexture?A.setTexture3D(b,0):b.isDataArrayTexture||b.isCompressedArrayTexture?A.setTexture2DArray(b,0):A.setTexture2D(b,0),Rt.unbindTexture()},this.resetState=function(){T=0,E=0,C=null,Rt.reset(),fe.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Zn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;const e=this.getContext();e.drawingBufferColorspace=qt._getDrawingBufferColorSpace(t),e.unpackColorSpace=qt._getUnpackColorSpace()}}class ao{constructor(t,e=25e-5){this.isFogExp2=!0,this.name="",this.color=new It(t),this.density=e}clone(){return new ao(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}}class av extends ve{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Pn,this.environmentIntensity=1,this.environmentRotation=new Pn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){const e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}}class lv{constructor(t,e){this.isInterleavedBuffer=!0,this.array=t,this.stride=e,this.count=t!==void 0?t.length/e:0,this.usage=el,this.updateRanges=[],this.version=0,this.uuid=Mn()}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,e,n){t*=this.stride,n*=e.stride;for(let i=0,r=this.stride;i<r;i++)this.array[t+i]=e.array[n+i];return this}set(t,e=0){return this.array.set(t,e),this}clone(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Mn()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const e=new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(e,this.stride);return n.setUsage(this.usage),n}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){return t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Mn()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const Oe=new L;class Rl{constructor(t,e,n,i=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=e,this.offset=n,this.normalized=i}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let e=0,n=this.data.count;e<n;e++)Oe.fromBufferAttribute(this,e),Oe.applyMatrix4(t),this.setXYZ(e,Oe.x,Oe.y,Oe.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)Oe.fromBufferAttribute(this,e),Oe.applyNormalMatrix(t),this.setXYZ(e,Oe.x,Oe.y,Oe.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)Oe.fromBufferAttribute(this,e),Oe.transformDirection(t),this.setXYZ(e,Oe.x,Oe.y,Oe.z);return this}getComponent(t,e){let n=this.array[t*this.data.stride+this.offset+e];return this.normalized&&(n=vn(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=ae(n,this.array)),this.data.array[t*this.data.stride+this.offset+e]=n,this}setX(t,e){return this.normalized&&(e=ae(e,this.array)),this.data.array[t*this.data.stride+this.offset]=e,this}setY(t,e){return this.normalized&&(e=ae(e,this.array)),this.data.array[t*this.data.stride+this.offset+1]=e,this}setZ(t,e){return this.normalized&&(e=ae(e,this.array)),this.data.array[t*this.data.stride+this.offset+2]=e,this}setW(t,e){return this.normalized&&(e=ae(e,this.array)),this.data.array[t*this.data.stride+this.offset+3]=e,this}getX(t){let e=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(e=vn(e,this.array)),e}getY(t){let e=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(e=vn(e,this.array)),e}getZ(t){let e=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(e=vn(e,this.array)),e}getW(t){let e=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(e=vn(e,this.array)),e}setXY(t,e,n){return t=t*this.data.stride+this.offset,this.normalized&&(e=ae(e,this.array),n=ae(n,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this}setXYZ(t,e,n,i){return t=t*this.data.stride+this.offset,this.normalized&&(e=ae(e,this.array),n=ae(n,this.array),i=ae(i,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=i,this}setXYZW(t,e,n,i,r){return t=t*this.data.stride+this.offset,this.normalized&&(e=ae(e,this.array),n=ae(n,this.array),i=ae(i,this.array),r=ae(r,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=i,this.data.array[t+3]=r,this}clone(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const e=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[i+r])}return new We(new this.array.constructor(e),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new Rl(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const e=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[i+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}const eh=new L,nh=new ee,ih=new ee,cv=new L,sh=new kt,Gr=new L,ia=new Dn,rh=new kt,sa=new pr;class hv extends R{constructor(t,e){super(t,e),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=oc,this.bindMatrix=new kt,this.bindMatrixInverse=new kt,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){const t=this.geometry;this.boundingBox===null&&(this.boundingBox=new wn),this.boundingBox.makeEmpty();const e=t.getAttribute("position");for(let n=0;n<e.count;n++)this.getVertexPosition(n,Gr),this.boundingBox.expandByPoint(Gr)}computeBoundingSphere(){const t=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new Dn),this.boundingSphere.makeEmpty();const e=t.getAttribute("position");for(let n=0;n<e.count;n++)this.getVertexPosition(n,Gr),this.boundingSphere.expandByPoint(Gr)}copy(t,e){return super.copy(t,e),this.bindMode=t.bindMode,this.bindMatrix.copy(t.bindMatrix),this.bindMatrixInverse.copy(t.bindMatrixInverse),this.skeleton=t.skeleton,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}raycast(t,e){const n=this.material,i=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),ia.copy(this.boundingSphere),ia.applyMatrix4(i),t.ray.intersectsSphere(ia)!==!1&&(rh.copy(i).invert(),sa.copy(t.ray).applyMatrix4(rh),!(this.boundingBox!==null&&sa.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(t,e,sa)))}getVertexPosition(t,e){return super.getVertexPosition(t,e),this.applyBoneTransform(t,e),e}bind(t,e){this.skeleton=t,e===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),e=this.matrixWorld),this.bindMatrix.copy(e),this.bindMatrixInverse.copy(e).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){const t=new ee,e=this.geometry.attributes.skinWeight;for(let n=0,i=e.count;n<i;n++){t.fromBufferAttribute(e,n);const r=1/t.manhattanLength();r!==1/0?t.multiplyScalar(r):t.set(1,0,0,0),e.setXYZW(n,t.x,t.y,t.z,t.w)}}updateMatrixWorld(t){super.updateMatrixWorld(t),this.bindMode===oc?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===_f?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(t,e){const n=this.skeleton,i=this.geometry;nh.fromBufferAttribute(i.attributes.skinIndex,t),ih.fromBufferAttribute(i.attributes.skinWeight,t),eh.copy(e).applyMatrix4(this.bindMatrix),e.set(0,0,0);for(let r=0;r<4;r++){const o=ih.getComponent(r);if(o!==0){const a=nh.getComponent(r);sh.multiplyMatrices(n.bones[a].matrixWorld,n.boneInverses[a]),e.addScaledVector(cv.copy(eh).applyMatrix4(sh),o)}}return e.applyMatrix4(this.bindMatrixInverse)}}class Id extends ve{constructor(){super(),this.isBone=!0,this.type="Bone"}}class Pd extends Te{constructor(t=null,e=1,n=1,i,r,o,a,l,c=Ve,h=Ve,d,u){super(null,o,a,l,c,h,i,r,d,u),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const oh=new kt,dv=new kt;class Il{constructor(t=[],e=[]){this.uuid=Mn(),this.bones=t.slice(0),this.boneInverses=e,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){const t=this.bones,e=this.boneInverses;if(this.boneMatrices=new Float32Array(t.length*16),e.length===0)this.calculateInverses();else if(t.length!==e.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,i=this.bones.length;n<i;n++)this.boneInverses.push(new kt)}}calculateInverses(){this.boneInverses.length=0;for(let t=0,e=this.bones.length;t<e;t++){const n=new kt;this.bones[t]&&n.copy(this.bones[t].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let t=0,e=this.bones.length;t<e;t++){const n=this.bones[t];n&&n.matrixWorld.copy(this.boneInverses[t]).invert()}for(let t=0,e=this.bones.length;t<e;t++){const n=this.bones[t];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){const t=this.bones,e=this.boneInverses,n=this.boneMatrices,i=this.boneTexture;for(let r=0,o=t.length;r<o;r++){const a=t[r]?t[r].matrixWorld:dv;oh.multiplyMatrices(a,e[r]),oh.toArray(n,r*16)}i!==null&&(i.needsUpdate=!0)}clone(){return new Il(this.bones,this.boneInverses)}computeBoneTexture(){let t=Math.sqrt(this.bones.length*4);t=Math.ceil(t/4)*4,t=Math.max(t,4);const e=new Float32Array(t*t*4);e.set(this.boneMatrices);const n=new Pd(e,t,t,cn,yn);return n.needsUpdate=!0,this.boneMatrices=e,this.boneTexture=n,this}getBoneByName(t){for(let e=0,n=this.bones.length;e<n;e++){const i=this.bones[e];if(i.name===t)return i}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(t,e){this.uuid=t.uuid;for(let n=0,i=t.bones.length;n<i;n++){const r=t.bones[n];let o=e[r];o===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",r),o=new Id),this.bones.push(o),this.boneInverses.push(new kt().fromArray(t.boneInverses[n]))}return this.init(),this}toJSON(){const t={metadata:{version:4.6,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};t.uuid=this.uuid;const e=this.bones,n=this.boneInverses;for(let i=0,r=e.length;i<r;i++){const o=e[i];t.bones.push(o.uuid);const a=n[i];t.boneInverses.push(a.toArray())}return t}}class il extends We{constructor(t,e,n,i=1){super(t,e,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){const t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}}const ds=new kt,ah=new kt,zr=[],lh=new wn,uv=new kt,qs=new R,$s=new Dn;class fv extends R{constructor(t,e,n){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new il(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,uv)}computeBoundingBox(){const t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new wn),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,ds),lh.copy(t.boundingBox).applyMatrix4(ds),this.boundingBox.union(lh)}computeBoundingSphere(){const t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new Dn),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,ds),$s.copy(t.boundingSphere).applyMatrix4(ds),this.boundingSphere.union($s)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){const n=e.morphTargetInfluences,i=this.morphTexture.source.data.data,r=n.length+1,o=t*r+1;for(let a=0;a<n.length;a++)n[a]=i[o+a]}raycast(t,e){const n=this.matrixWorld,i=this.count;if(qs.geometry=this.geometry,qs.material=this.material,qs.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),$s.copy(this.boundingSphere),$s.applyMatrix4(n),t.ray.intersectsSphere($s)!==!1))for(let r=0;r<i;r++){this.getMatrixAt(r,ds),ah.multiplyMatrices(n,ds),qs.matrixWorld=ah,qs.raycast(t,zr);for(let o=0,a=zr.length;o<a;o++){const l=zr[o];l.instanceId=r,l.object=this,e.push(l)}zr.length=0}}setColorAt(t,e){this.instanceColor===null&&(this.instanceColor=new il(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3)}setMatrixAt(t,e){e.toArray(this.instanceMatrix.array,t*16)}setMorphAt(t,e){const n=e.morphTargetInfluences,i=n.length+1;this.morphTexture===null&&(this.morphTexture=new Pd(new Float32Array(i*this.count),i,this.count,yl,yn));const r=this.morphTexture.source.data.data;let o=0;for(let c=0;c<n.length;c++)o+=n[c];const a=this.geometry.morphTargetsRelative?1:1-o,l=i*t;r[l]=a,r.set(n,l+1)}updateMorphTargets(){}dispose(){return this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null),this}}class Ld extends Rn{static get type(){return"LineBasicMaterial"}constructor(t){super(),this.isLineBasicMaterial=!0,this.color=new It(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}}const lo=new L,co=new L,ch=new kt,Ks=new pr,Vr=new Dn,ra=new L,hh=new L;class Pl extends ve{constructor(t=new qe,e=new Ld){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,n=[0];for(let i=1,r=e.count;i<r;i++)lo.fromBufferAttribute(e,i-1),co.fromBufferAttribute(e,i),n[i]=n[i-1],n[i]+=lo.distanceTo(co);t.setAttribute("lineDistance",new xe(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(t,e){const n=this.geometry,i=this.matrixWorld,r=t.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Vr.copy(n.boundingSphere),Vr.applyMatrix4(i),Vr.radius+=r,t.ray.intersectsSphere(Vr)===!1)return;ch.copy(i).invert(),Ks.copy(t.ray).applyMatrix4(ch);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,h=n.index,u=n.attributes.position;if(h!==null){const f=Math.max(0,o.start),g=Math.min(h.count,o.start+o.count);for(let _=f,m=g-1;_<m;_+=c){const p=h.getX(_),y=h.getX(_+1),M=Wr(this,t,Ks,l,p,y);M&&e.push(M)}if(this.isLineLoop){const _=h.getX(g-1),m=h.getX(f),p=Wr(this,t,Ks,l,_,m);p&&e.push(p)}}else{const f=Math.max(0,o.start),g=Math.min(u.count,o.start+o.count);for(let _=f,m=g-1;_<m;_+=c){const p=Wr(this,t,Ks,l,_,_+1);p&&e.push(p)}if(this.isLineLoop){const _=Wr(this,t,Ks,l,g-1,f);_&&e.push(_)}}}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const i=e[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){const a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function Wr(s,t,e,n,i,r){const o=s.geometry.attributes.position;if(lo.fromBufferAttribute(o,i),co.fromBufferAttribute(o,r),e.distanceSqToSegment(lo,co,ra,hh)>n)return;ra.applyMatrix4(s.matrixWorld);const l=t.ray.origin.distanceTo(ra);if(!(l<t.near||l>t.far))return{distance:l,point:hh.clone().applyMatrix4(s.matrixWorld),index:i,face:null,faceIndex:null,barycoord:null,object:s}}const dh=new L,uh=new L;class pv extends Pl{constructor(t,e){super(t,e),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,n=[];for(let i=0,r=e.count;i<r;i+=2)dh.fromBufferAttribute(e,i),uh.fromBufferAttribute(e,i+1),n[i]=i===0?0:n[i-1],n[i+1]=n[i]+dh.distanceTo(uh);t.setAttribute("lineDistance",new xe(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class mv extends Pl{constructor(t,e){super(t,e),this.isLineLoop=!0,this.type="LineLoop"}}class Dd extends Rn{static get type(){return"PointsMaterial"}constructor(t){super(),this.isPointsMaterial=!0,this.color=new It(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}const fh=new kt,sl=new pr,Xr=new Dn,Yr=new L;class gv extends ve{constructor(t=new qe,e=new Dd){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}raycast(t,e){const n=this.geometry,i=this.matrixWorld,r=t.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Xr.copy(n.boundingSphere),Xr.applyMatrix4(i),Xr.radius+=r,t.ray.intersectsSphere(Xr)===!1)return;fh.copy(i).invert(),sl.copy(t.ray).applyMatrix4(fh);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=n.index,d=n.attributes.position;if(c!==null){const u=Math.max(0,o.start),f=Math.min(c.count,o.start+o.count);for(let g=u,_=f;g<_;g++){const m=c.getX(g);Yr.fromBufferAttribute(d,m),ph(Yr,m,l,i,t,e,this)}}else{const u=Math.max(0,o.start),f=Math.min(d.count,o.start+o.count);for(let g=u,_=f;g<_;g++)Yr.fromBufferAttribute(d,g),ph(Yr,g,l,i,t,e,this)}}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const i=e[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){const a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function ph(s,t,e,n,i,r,o){const a=sl.distanceSqToPoint(s);if(a<e){const l=new L;sl.closestPointToPoint(s,l),l.applyMatrix4(n);const c=i.ray.origin.distanceTo(l);if(c<i.near||c>i.far)return;r.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:t,face:null,faceIndex:null,barycoord:null,object:o})}}class _v extends Te{constructor(t,e,n,i,r,o,a,l,c){super(t,e,n,i,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class Yt extends qe{constructor(t=1,e=1,n=1,i=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:i,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};const c=this;i=Math.floor(i),r=Math.floor(r);const h=[],d=[],u=[],f=[];let g=0;const _=[],m=n/2;let p=0;y(),o===!1&&(t>0&&M(!0),e>0&&M(!1)),this.setIndex(h),this.setAttribute("position",new xe(d,3)),this.setAttribute("normal",new xe(u,3)),this.setAttribute("uv",new xe(f,2));function y(){const v=new L,I=new L;let T=0;const E=(e-t)/n;for(let C=0;C<=r;C++){const S=[],x=C/r,P=x*(e-t)+t;for(let F=0;F<=i;F++){const N=F/i,H=N*l+a,z=Math.sin(H),V=Math.cos(H);I.x=P*z,I.y=-x*n+m,I.z=P*V,d.push(I.x,I.y,I.z),v.set(z,E,V).normalize(),u.push(v.x,v.y,v.z),f.push(N,1-x),S.push(g++)}_.push(S)}for(let C=0;C<i;C++)for(let S=0;S<r;S++){const x=_[S][C],P=_[S+1][C],F=_[S+1][C+1],N=_[S][C+1];(t>0||S!==0)&&(h.push(x,P,N),T+=3),(e>0||S!==r-1)&&(h.push(P,F,N),T+=3)}c.addGroup(p,T,0),p+=T}function M(v){const I=g,T=new zt,E=new L;let C=0;const S=v===!0?t:e,x=v===!0?1:-1;for(let F=1;F<=i;F++)d.push(0,m*x,0),u.push(0,x,0),f.push(.5,.5),g++;const P=g;for(let F=0;F<=i;F++){const H=F/i*l+a,z=Math.cos(H),V=Math.sin(H);E.x=S*V,E.y=m*x,E.z=S*z,d.push(E.x,E.y,E.z),u.push(0,x,0),T.x=z*.5+.5,T.y=V*.5*x+.5,f.push(T.x,T.y),g++}for(let F=0;F<i;F++){const N=I+F,H=P+F;v===!0?h.push(H,H+1,N):h.push(H+1,H,N),C+=3}c.addGroup(p,C,v===!0?1:2),p+=C}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Yt(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class Pe extends Yt{constructor(t=1,e=1,n=32,i=1,r=!1,o=0,a=Math.PI*2){super(0,t,e,n,i,r,o,a),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:n,heightSegments:i,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(t){return new Pe(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}}class mr extends qe{constructor(t=[],e=[],n=1,i=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:n,detail:i};const r=[],o=[];a(i),c(n),h(),this.setAttribute("position",new xe(r,3)),this.setAttribute("normal",new xe(r.slice(),3)),this.setAttribute("uv",new xe(o,2)),i===0?this.computeVertexNormals():this.normalizeNormals();function a(y){const M=new L,v=new L,I=new L;for(let T=0;T<e.length;T+=3)f(e[T+0],M),f(e[T+1],v),f(e[T+2],I),l(M,v,I,y)}function l(y,M,v,I){const T=I+1,E=[];for(let C=0;C<=T;C++){E[C]=[];const S=y.clone().lerp(v,C/T),x=M.clone().lerp(v,C/T),P=T-C;for(let F=0;F<=P;F++)F===0&&C===T?E[C][F]=S:E[C][F]=S.clone().lerp(x,F/P)}for(let C=0;C<T;C++)for(let S=0;S<2*(T-C)-1;S++){const x=Math.floor(S/2);S%2===0?(u(E[C][x+1]),u(E[C+1][x]),u(E[C][x])):(u(E[C][x+1]),u(E[C+1][x+1]),u(E[C+1][x]))}}function c(y){const M=new L;for(let v=0;v<r.length;v+=3)M.x=r[v+0],M.y=r[v+1],M.z=r[v+2],M.normalize().multiplyScalar(y),r[v+0]=M.x,r[v+1]=M.y,r[v+2]=M.z}function h(){const y=new L;for(let M=0;M<r.length;M+=3){y.x=r[M+0],y.y=r[M+1],y.z=r[M+2];const v=m(y)/2/Math.PI+.5,I=p(y)/Math.PI+.5;o.push(v,1-I)}g(),d()}function d(){for(let y=0;y<o.length;y+=6){const M=o[y+0],v=o[y+2],I=o[y+4],T=Math.max(M,v,I),E=Math.min(M,v,I);T>.9&&E<.1&&(M<.2&&(o[y+0]+=1),v<.2&&(o[y+2]+=1),I<.2&&(o[y+4]+=1))}}function u(y){r.push(y.x,y.y,y.z)}function f(y,M){const v=y*3;M.x=t[v+0],M.y=t[v+1],M.z=t[v+2]}function g(){const y=new L,M=new L,v=new L,I=new L,T=new zt,E=new zt,C=new zt;for(let S=0,x=0;S<r.length;S+=9,x+=6){y.set(r[S+0],r[S+1],r[S+2]),M.set(r[S+3],r[S+4],r[S+5]),v.set(r[S+6],r[S+7],r[S+8]),T.set(o[x+0],o[x+1]),E.set(o[x+2],o[x+3]),C.set(o[x+4],o[x+5]),I.copy(y).add(M).add(v).divideScalar(3);const P=m(I);_(T,x+0,y,P),_(E,x+2,M,P),_(C,x+4,v,P)}}function _(y,M,v,I){I<0&&y.x===1&&(o[M]=y.x-1),v.x===0&&v.z===0&&(o[M]=I/2/Math.PI+.5)}function m(y){return Math.atan2(y.z,-y.x)}function p(y){return Math.atan2(-y.y,Math.sqrt(y.x*y.x+y.z*y.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new mr(t.vertices,t.indices,t.radius,t.details)}}class Wi extends mr{constructor(t=1,e=0){const n=(1+Math.sqrt(5))/2,i=1/n,r=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-i,-n,0,-i,n,0,i,-n,0,i,n,-i,-n,0,-i,n,0,i,-n,0,i,n,0,-n,0,-i,n,0,-i,-n,0,i,n,0,i],o=[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9];super(r,o,t,e),this.type="DodecahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new Wi(t.radius,t.detail)}}class Ll extends mr{constructor(t=1,e=0){const n=(1+Math.sqrt(5))/2,i=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(i,r,t,e),this.type="IcosahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new Ll(t.radius,t.detail)}}class gn extends mr{constructor(t=1,e=0){const n=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],i=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(n,i,t,e),this.type="OctahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new gn(t.radius,t.detail)}}class Ae extends qe{constructor(t=.5,e=1,n=32,i=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:e,thetaSegments:n,phiSegments:i,thetaStart:r,thetaLength:o},n=Math.max(3,n),i=Math.max(1,i);const a=[],l=[],c=[],h=[];let d=t;const u=(e-t)/i,f=new L,g=new zt;for(let _=0;_<=i;_++){for(let m=0;m<=n;m++){const p=r+m/n*o;f.x=d*Math.cos(p),f.y=d*Math.sin(p),l.push(f.x,f.y,f.z),c.push(0,0,1),g.x=(f.x/e+1)/2,g.y=(f.y/e+1)/2,h.push(g.x,g.y)}d+=u}for(let _=0;_<i;_++){const m=_*(n+1);for(let p=0;p<n;p++){const y=p+m,M=y,v=y+n+1,I=y+n+2,T=y+1;a.push(M,v,T),a.push(v,I,T)}}this.setIndex(a),this.setAttribute("position",new xe(l,3)),this.setAttribute("normal",new xe(c,3)),this.setAttribute("uv",new xe(h,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Ae(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}}class Vi extends qe{constructor(t=1,e=32,n=16,i=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:i,phiLength:r,thetaStart:o,thetaLength:a},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));const l=Math.min(o+a,Math.PI);let c=0;const h=[],d=new L,u=new L,f=[],g=[],_=[],m=[];for(let p=0;p<=n;p++){const y=[],M=p/n;let v=0;p===0&&o===0?v=.5/e:p===n&&l===Math.PI&&(v=-.5/e);for(let I=0;I<=e;I++){const T=I/e;d.x=-t*Math.cos(i+T*r)*Math.sin(o+M*a),d.y=t*Math.cos(o+M*a),d.z=t*Math.sin(i+T*r)*Math.sin(o+M*a),g.push(d.x,d.y,d.z),u.copy(d).normalize(),_.push(u.x,u.y,u.z),m.push(T+v,1-M),y.push(c++)}h.push(y)}for(let p=0;p<n;p++)for(let y=0;y<e;y++){const M=h[p][y+1],v=h[p][y],I=h[p+1][y],T=h[p+1][y+1];(p!==0||o>0)&&f.push(M,v,T),(p!==n-1||l<Math.PI)&&f.push(v,I,T)}this.setIndex(f),this.setAttribute("position",new xe(g,3)),this.setAttribute("normal",new xe(_,3)),this.setAttribute("uv",new xe(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Vi(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}}class ho extends qe{constructor(t=1,e=.4,n=12,i=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:n,tubularSegments:i,arc:r},n=Math.floor(n),i=Math.floor(i);const o=[],a=[],l=[],c=[],h=new L,d=new L,u=new L;for(let f=0;f<=n;f++)for(let g=0;g<=i;g++){const _=g/i*r,m=f/n*Math.PI*2;d.x=(t+e*Math.cos(m))*Math.cos(_),d.y=(t+e*Math.cos(m))*Math.sin(_),d.z=e*Math.sin(m),a.push(d.x,d.y,d.z),h.x=t*Math.cos(_),h.y=t*Math.sin(_),u.subVectors(d,h).normalize(),l.push(u.x,u.y,u.z),c.push(g/i),c.push(f/n)}for(let f=1;f<=n;f++)for(let g=1;g<=i;g++){const _=(i+1)*f+g-1,m=(i+1)*(f-1)+g-1,p=(i+1)*(f-1)+g,y=(i+1)*f+g;o.push(_,m,y),o.push(m,p,y)}this.setIndex(o),this.setAttribute("position",new xe(a,3)),this.setAttribute("normal",new xe(l,3)),this.setAttribute("uv",new xe(c,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new ho(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc)}}class et extends Rn{static get type(){return"MeshStandardMaterial"}constructor(t){super(),this.isMeshStandardMaterial=!0,this.defines={STANDARD:""},this.color=new It(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new It(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=fd,this.normalScale=new zt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Pn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class Nn extends et{static get type(){return"MeshPhysicalMaterial"}constructor(t){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new zt(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return ke(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(e){this.ior=(1+.4*e)/(1-.4*e)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new It(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new It(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new It(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(t)}get anisotropy(){return this._anisotropy}set anisotropy(t){this._anisotropy>0!=t>0&&this.version++,this._anisotropy=t}get clearcoat(){return this._clearcoat}set clearcoat(t){this._clearcoat>0!=t>0&&this.version++,this._clearcoat=t}get iridescence(){return this._iridescence}set iridescence(t){this._iridescence>0!=t>0&&this.version++,this._iridescence=t}get dispersion(){return this._dispersion}set dispersion(t){this._dispersion>0!=t>0&&this.version++,this._dispersion=t}get sheen(){return this._sheen}set sheen(t){this._sheen>0!=t>0&&this.version++,this._sheen=t}get transmission(){return this._transmission}set transmission(t){this._transmission>0!=t>0&&this.version++,this._transmission=t}copy(t){return super.copy(t),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=t.anisotropy,this.anisotropyRotation=t.anisotropyRotation,this.anisotropyMap=t.anisotropyMap,this.clearcoat=t.clearcoat,this.clearcoatMap=t.clearcoatMap,this.clearcoatRoughness=t.clearcoatRoughness,this.clearcoatRoughnessMap=t.clearcoatRoughnessMap,this.clearcoatNormalMap=t.clearcoatNormalMap,this.clearcoatNormalScale.copy(t.clearcoatNormalScale),this.dispersion=t.dispersion,this.ior=t.ior,this.iridescence=t.iridescence,this.iridescenceMap=t.iridescenceMap,this.iridescenceIOR=t.iridescenceIOR,this.iridescenceThicknessRange=[...t.iridescenceThicknessRange],this.iridescenceThicknessMap=t.iridescenceThicknessMap,this.sheen=t.sheen,this.sheenColor.copy(t.sheenColor),this.sheenColorMap=t.sheenColorMap,this.sheenRoughness=t.sheenRoughness,this.sheenRoughnessMap=t.sheenRoughnessMap,this.transmission=t.transmission,this.transmissionMap=t.transmissionMap,this.thickness=t.thickness,this.thicknessMap=t.thicknessMap,this.attenuationDistance=t.attenuationDistance,this.attenuationColor.copy(t.attenuationColor),this.specularIntensity=t.specularIntensity,this.specularIntensityMap=t.specularIntensityMap,this.specularColor.copy(t.specularColor),this.specularColorMap=t.specularColorMap,this}}function qr(s,t,e){return!s||!e&&s.constructor===t?s:typeof t.BYTES_PER_ELEMENT=="number"?new t(s):Array.prototype.slice.call(s)}function vv(s){return ArrayBuffer.isView(s)&&!(s instanceof DataView)}function xv(s){function t(i,r){return s[i]-s[r]}const e=s.length,n=new Array(e);for(let i=0;i!==e;++i)n[i]=i;return n.sort(t),n}function mh(s,t,e){const n=s.length,i=new s.constructor(n);for(let r=0,o=0;o!==n;++r){const a=e[r]*t;for(let l=0;l!==t;++l)i[o++]=s[a+l]}return i}function Nd(s,t,e,n){let i=1,r=s[0];for(;r!==void 0&&r[n]===void 0;)r=s[i++];if(r===void 0)return;let o=r[n];if(o!==void 0)if(Array.isArray(o))do o=r[n],o!==void 0&&(t.push(r.time),e.push.apply(e,o)),r=s[i++];while(r!==void 0);else if(o.toArray!==void 0)do o=r[n],o!==void 0&&(t.push(r.time),o.toArray(e,e.length)),r=s[i++];while(r!==void 0);else do o=r[n],o!==void 0&&(t.push(r.time),e.push(o)),r=s[i++];while(r!==void 0)}class gr{constructor(t,e,n,i){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new e.constructor(n),this.sampleValues=e,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(t){const e=this.parameterPositions;let n=this._cachedIndex,i=e[n],r=e[n-1];t:{e:{let o;n:{i:if(!(t<i)){for(let a=n+2;;){if(i===void 0){if(t<r)break i;return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=i,i=e[++n],t<i)break e}o=e.length;break n}if(!(t>=r)){const a=e[1];t<a&&(n=2,r=a);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(i=r,r=e[--n-1],t>=r)break e}o=n,n=0;break n}break t}for(;n<o;){const a=n+o>>>1;t<e[a]?o=a:n=a+1}if(i=e[n],r=e[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,i)}return this.interpolate_(n,r,t,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){const e=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=t*i;for(let o=0;o!==i;++o)e[o]=n[r+o];return e}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}}class yv extends gr{constructor(t,e,n,i){super(t,e,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:ms,endingEnd:ms}}intervalChanged_(t,e,n){const i=this.parameterPositions;let r=t-2,o=t+1,a=i[r],l=i[o];if(a===void 0)switch(this.getSettings_().endingStart){case gs:r=t,a=2*e-n;break;case ro:r=i.length-2,a=e+i[r]-i[r+1];break;default:r=t,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case gs:o=t,l=2*n-e;break;case ro:o=1,l=n+i[1]-i[0];break;default:o=t-1,l=e}const c=(n-e)*.5,h=this.valueSize;this._weightPrev=c/(e-a),this._weightNext=c/(l-n),this._offsetPrev=r*h,this._offsetNext=o*h}interpolate_(t,e,n,i){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,h=this._offsetPrev,d=this._offsetNext,u=this._weightPrev,f=this._weightNext,g=(n-e)/(i-e),_=g*g,m=_*g,p=-u*m+2*u*_-u*g,y=(1+u)*m+(-1.5-2*u)*_+(-.5+u)*g+1,M=(-1-f)*m+(1.5+f)*_+.5*g,v=f*m-f*_;for(let I=0;I!==a;++I)r[I]=p*o[h+I]+y*o[c+I]+M*o[l+I]+v*o[d+I];return r}}class Ud extends gr{constructor(t,e,n,i){super(t,e,n,i)}interpolate_(t,e,n,i){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=t*a,c=l-a,h=(n-e)/(i-e),d=1-h;for(let u=0;u!==a;++u)r[u]=o[c+u]*d+o[l+u]*h;return r}}class Mv extends gr{constructor(t,e,n,i){super(t,e,n,i)}interpolate_(t){return this.copySampleValue_(t-1)}}class Un{constructor(t,e,n,i){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=qr(e,this.TimeBufferType),this.values=qr(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(t){const e=t.constructor;let n;if(e.toJSON!==this.toJSON)n=e.toJSON(t);else{n={name:t.name,times:qr(t.times,Array),values:qr(t.values,Array)};const i=t.getInterpolation();i!==t.DefaultInterpolation&&(n.interpolation=i)}return n.type=t.ValueTypeName,n}InterpolantFactoryMethodDiscrete(t){return new Mv(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new Ud(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new yv(this.times,this.values,this.getValueSize(),t)}setInterpolation(t){let e;switch(t){case cr:e=this.InterpolantFactoryMethodDiscrete;break;case hr:e=this.InterpolantFactoryMethodLinear;break;case Ro:e=this.InterpolantFactoryMethodSmooth;break}if(e===void 0){const n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return cr;case this.InterpolantFactoryMethodLinear:return hr;case this.InterpolantFactoryMethodSmooth:return Ro}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){const e=this.times;for(let n=0,i=e.length;n!==i;++n)e[n]+=t}return this}scale(t){if(t!==1){const e=this.times;for(let n=0,i=e.length;n!==i;++n)e[n]*=t}return this}trim(t,e){const n=this.times,i=n.length;let r=0,o=i-1;for(;r!==i&&n[r]<t;)++r;for(;o!==-1&&n[o]>e;)--o;if(++o,r!==0||o!==i){r>=o&&(o=Math.max(o,1),r=o-1);const a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let t=!0;const e=this.getValueSize();e-Math.floor(e)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),t=!1);const n=this.times,i=this.values,r=n.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),t=!1);let o=null;for(let a=0;a!==r;a++){const l=n[a];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,l),t=!1;break}if(o!==null&&o>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,l,o),t=!1;break}o=l}if(i!==void 0&&vv(i))for(let a=0,l=i.length;a!==l;++a){const c=i[a];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,c),t=!1;break}}return t}optimize(){const t=this.times.slice(),e=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===Ro,r=t.length-1;let o=1;for(let a=1;a<r;++a){let l=!1;const c=t[a],h=t[a+1];if(c!==h&&(a!==1||c!==t[0]))if(i)l=!0;else{const d=a*n,u=d-n,f=d+n;for(let g=0;g!==n;++g){const _=e[d+g];if(_!==e[u+g]||_!==e[f+g]){l=!0;break}}}if(l){if(a!==o){t[o]=t[a];const d=a*n,u=o*n;for(let f=0;f!==n;++f)e[u+f]=e[d+f]}++o}}if(r>0){t[o]=t[r];for(let a=r*n,l=o*n,c=0;c!==n;++c)e[l+c]=e[a+c];++o}return o!==t.length?(this.times=t.slice(0,o),this.values=e.slice(0,o*n)):(this.times=t,this.values=e),this}clone(){const t=this.times.slice(),e=this.values.slice(),n=this.constructor,i=new n(this.name,t,e);return i.createInterpolant=this.createInterpolant,i}}Un.prototype.TimeBufferType=Float32Array;Un.prototype.ValueBufferType=Float32Array;Un.prototype.DefaultInterpolation=hr;class Os extends Un{constructor(t,e,n){super(t,e,n)}}Os.prototype.ValueTypeName="bool";Os.prototype.ValueBufferType=Array;Os.prototype.DefaultInterpolation=cr;Os.prototype.InterpolantFactoryMethodLinear=void 0;Os.prototype.InterpolantFactoryMethodSmooth=void 0;class kd extends Un{}kd.prototype.ValueTypeName="color";class Ds extends Un{}Ds.prototype.ValueTypeName="number";class Sv extends gr{constructor(t,e,n,i){super(t,e,n,i)}interpolate_(t,e,n,i){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-e)/(i-e);let c=t*a;for(let h=c+a;c!==h;c+=4)Sn.slerpFlat(r,0,o,c-a,o,c,l);return r}}class Ns extends Un{InterpolantFactoryMethodLinear(t){return new Sv(this.times,this.values,this.getValueSize(),t)}}Ns.prototype.ValueTypeName="quaternion";Ns.prototype.InterpolantFactoryMethodSmooth=void 0;class Bs extends Un{constructor(t,e,n){super(t,e,n)}}Bs.prototype.ValueTypeName="string";Bs.prototype.ValueBufferType=Array;Bs.prototype.DefaultInterpolation=cr;Bs.prototype.InterpolantFactoryMethodLinear=void 0;Bs.prototype.InterpolantFactoryMethodSmooth=void 0;class Us extends Un{}Us.prototype.ValueTypeName="vector";class rl{constructor(t="",e=-1,n=[],i=bl){this.name=t,this.tracks=n,this.duration=e,this.blendMode=i,this.uuid=Mn(),this.duration<0&&this.resetDuration()}static parse(t){const e=[],n=t.tracks,i=1/(t.fps||1);for(let o=0,a=n.length;o!==a;++o)e.push(bv(n[o]).scale(i));const r=new this(t.name,t.duration,e,t.blendMode);return r.uuid=t.uuid,r}static toJSON(t){const e=[],n=t.tracks,i={name:t.name,duration:t.duration,tracks:e,uuid:t.uuid,blendMode:t.blendMode};for(let r=0,o=n.length;r!==o;++r)e.push(Un.toJSON(n[r]));return i}static CreateFromMorphTargetSequence(t,e,n,i){const r=e.length,o=[];for(let a=0;a<r;a++){let l=[],c=[];l.push((a+r-1)%r,a,(a+1)%r),c.push(0,1,0);const h=xv(l);l=mh(l,1,h),c=mh(c,1,h),!i&&l[0]===0&&(l.push(r),c.push(c[0])),o.push(new Ds(".morphTargetInfluences["+e[a].name+"]",l,c).scale(1/n))}return new this(t,-1,o)}static findByName(t,e){let n=t;if(!Array.isArray(t)){const i=t;n=i.geometry&&i.geometry.animations||i.animations}for(let i=0;i<n.length;i++)if(n[i].name===e)return n[i];return null}static CreateClipsFromMorphTargetSequences(t,e,n){const i={},r=/^([\w-]*?)([\d]+)$/;for(let a=0,l=t.length;a<l;a++){const c=t[a],h=c.name.match(r);if(h&&h.length>1){const d=h[1];let u=i[d];u||(i[d]=u=[]),u.push(c)}}const o=[];for(const a in i)o.push(this.CreateFromMorphTargetSequence(a,i[a],e,n));return o}static parseAnimation(t,e){if(!t)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;const n=function(d,u,f,g,_){if(f.length!==0){const m=[],p=[];Nd(f,m,p,g),m.length!==0&&_.push(new d(u,m,p))}},i=[],r=t.name||"default",o=t.fps||30,a=t.blendMode;let l=t.length||-1;const c=t.hierarchy||[];for(let d=0;d<c.length;d++){const u=c[d].keys;if(!(!u||u.length===0))if(u[0].morphTargets){const f={};let g;for(g=0;g<u.length;g++)if(u[g].morphTargets)for(let _=0;_<u[g].morphTargets.length;_++)f[u[g].morphTargets[_]]=-1;for(const _ in f){const m=[],p=[];for(let y=0;y!==u[g].morphTargets.length;++y){const M=u[g];m.push(M.time),p.push(M.morphTarget===_?1:0)}i.push(new Ds(".morphTargetInfluence["+_+"]",m,p))}l=f.length*o}else{const f=".bones["+e[d].name+"]";n(Us,f+".position",u,"pos",i),n(Ns,f+".quaternion",u,"rot",i),n(Us,f+".scale",u,"scl",i)}}return i.length===0?null:new this(r,l,i,a)}resetDuration(){const t=this.tracks;let e=0;for(let n=0,i=t.length;n!==i;++n){const r=this.tracks[n];e=Math.max(e,r.times[r.times.length-1])}return this.duration=e,this}trim(){for(let t=0;t<this.tracks.length;t++)this.tracks[t].trim(0,this.duration);return this}validate(){let t=!0;for(let e=0;e<this.tracks.length;e++)t=t&&this.tracks[e].validate();return t}optimize(){for(let t=0;t<this.tracks.length;t++)this.tracks[t].optimize();return this}clone(){const t=[];for(let e=0;e<this.tracks.length;e++)t.push(this.tracks[e].clone());return new this.constructor(this.name,this.duration,t,this.blendMode)}toJSON(){return this.constructor.toJSON(this)}}function wv(s){switch(s.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Ds;case"vector":case"vector2":case"vector3":case"vector4":return Us;case"color":return kd;case"quaternion":return Ns;case"bool":case"boolean":return Os;case"string":return Bs}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+s)}function bv(s){if(s.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");const t=wv(s.type);if(s.times===void 0){const e=[],n=[];Nd(s.keys,e,n,"value"),s.times=e,s.values=n}return t.parse!==void 0?t.parse(s):new t(s.name,s.times,s.values,s.interpolation)}const wi={enabled:!1,files:{},add:function(s,t){this.enabled!==!1&&(this.files[s]=t)},get:function(s){if(this.enabled!==!1)return this.files[s]},remove:function(s){delete this.files[s]},clear:function(){this.files={}}};class Ev{constructor(t,e,n){const i=this;let r=!1,o=0,a=0,l;const c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this.itemStart=function(h){a++,r===!1&&i.onStart!==void 0&&i.onStart(h,o,a),r=!0},this.itemEnd=function(h){o++,i.onProgress!==void 0&&i.onProgress(h,o,a),o===a&&(r=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(h){i.onError!==void 0&&i.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,d){return c.push(h,d),this},this.removeHandler=function(h){const d=c.indexOf(h);return d!==-1&&c.splice(d,2),this},this.getHandler=function(h){for(let d=0,u=c.length;d<u;d+=2){const f=c[d],g=c[d+1];if(f.global&&(f.lastIndex=0),f.test(h))return g}return null}}}const Av=new Ev;class Hs{constructor(t){this.manager=t!==void 0?t:Av,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(t,e){const n=this;return new Promise(function(i,r){n.load(t,i,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}}Hs.DEFAULT_MATERIAL_NAME="__DEFAULT";const Xn={};class Tv extends Error{constructor(t,e){super(t),this.response=e}}class Fd extends Hs{constructor(t){super(t)}load(t,e,n,i){t===void 0&&(t=""),this.path!==void 0&&(t=this.path+t),t=this.manager.resolveURL(t);const r=wi.get(t);if(r!==void 0)return this.manager.itemStart(t),setTimeout(()=>{e&&e(r),this.manager.itemEnd(t)},0),r;if(Xn[t]!==void 0){Xn[t].push({onLoad:e,onProgress:n,onError:i});return}Xn[t]=[],Xn[t].push({onLoad:e,onProgress:n,onError:i});const o=new Request(t,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin"}),a=this.mimeType,l=this.responseType;fetch(o).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||c.body===void 0||c.body.getReader===void 0)return c;const h=Xn[t],d=c.body.getReader(),u=c.headers.get("X-File-Size")||c.headers.get("Content-Length"),f=u?parseInt(u):0,g=f!==0;let _=0;const m=new ReadableStream({start(p){y();function y(){d.read().then(({done:M,value:v})=>{if(M)p.close();else{_+=v.byteLength;const I=new ProgressEvent("progress",{lengthComputable:g,loaded:_,total:f});for(let T=0,E=h.length;T<E;T++){const C=h[T];C.onProgress&&C.onProgress(I)}p.enqueue(v),y()}},M=>{p.error(M)})}}});return new Response(m)}else throw new Tv(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`,c)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(h=>new DOMParser().parseFromString(h,a));case"json":return c.json();default:if(a===void 0)return c.text();{const d=/charset="?([^;"\s]*)"?/i.exec(a),u=d&&d[1]?d[1].toLowerCase():void 0,f=new TextDecoder(u);return c.arrayBuffer().then(g=>f.decode(g))}}}).then(c=>{wi.add(t,c);const h=Xn[t];delete Xn[t];for(let d=0,u=h.length;d<u;d++){const f=h[d];f.onLoad&&f.onLoad(c)}}).catch(c=>{const h=Xn[t];if(h===void 0)throw this.manager.itemError(t),c;delete Xn[t];for(let d=0,u=h.length;d<u;d++){const f=h[d];f.onError&&f.onError(c)}this.manager.itemError(t)}).finally(()=>{this.manager.itemEnd(t)}),this.manager.itemStart(t)}setResponseType(t){return this.responseType=t,this}setMimeType(t){return this.mimeType=t,this}}class Cv extends Hs{constructor(t){super(t)}load(t,e,n,i){this.path!==void 0&&(t=this.path+t),t=this.manager.resolveURL(t);const r=this,o=wi.get(t);if(o!==void 0)return r.manager.itemStart(t),setTimeout(function(){e&&e(o),r.manager.itemEnd(t)},0),o;const a=dr("img");function l(){h(),wi.add(t,this),e&&e(this),r.manager.itemEnd(t)}function c(d){h(),i&&i(d),r.manager.itemError(t),r.manager.itemEnd(t)}function h(){a.removeEventListener("load",l,!1),a.removeEventListener("error",c,!1)}return a.addEventListener("load",l,!1),a.addEventListener("error",c,!1),t.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),r.manager.itemStart(t),a.src=t,a}}class Od extends Hs{constructor(t){super(t)}load(t,e,n,i){const r=new Te,o=new Cv(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(t,function(a){r.image=a,r.needsUpdate=!0,e!==void 0&&e(r)},n,i),r}}class _r extends ve{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new It(t),this.intensity=e}dispose(){}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){const e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,this.groundColor!==void 0&&(e.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(e.object.distance=this.distance),this.angle!==void 0&&(e.object.angle=this.angle),this.decay!==void 0&&(e.object.decay=this.decay),this.penumbra!==void 0&&(e.object.penumbra=this.penumbra),this.shadow!==void 0&&(e.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(e.object.target=this.target.uuid),e}}class Rv extends _r{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(ve.DEFAULT_UP),this.updateMatrix(),this.groundColor=new It(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}}const oa=new kt,gh=new L,_h=new L;class Dl{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new zt(512,512),this.map=null,this.mapPass=null,this.matrix=new kt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Tl,this._frameExtents=new zt(1,1),this._viewportCount=1,this._viewports=[new ee(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){const e=this.camera,n=this.matrix;gh.setFromMatrixPosition(t.matrixWorld),e.position.copy(gh),_h.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(_h),e.updateMatrixWorld(),oa.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this._frustum.setFromProjectionMatrix(oa),n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(oa)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.mapSize.copy(t.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const t={};return this.intensity!==1&&(t.intensity=this.intensity),this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}}class Iv extends Dl{constructor(){super(new Ke(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1}updateMatrices(t){const e=this.camera,n=Ps*2*t.angle*this.focus,i=this.mapSize.width/this.mapSize.height,r=t.distance||e.far;(n!==e.fov||i!==e.aspect||r!==e.far)&&(e.fov=n,e.aspect=i,e.far=r,e.updateProjectionMatrix()),super.updateMatrices(t)}copy(t){return super.copy(t),this.focus=t.focus,this}}class Pv extends _r{constructor(t,e,n=0,i=Math.PI/3,r=0,o=2){super(t,e),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(ve.DEFAULT_UP),this.updateMatrix(),this.target=new ve,this.distance=n,this.angle=i,this.penumbra=r,this.decay=o,this.map=null,this.shadow=new Iv}get power(){return this.intensity*Math.PI}set power(t){this.intensity=t/Math.PI}dispose(){this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.angle=t.angle,this.penumbra=t.penumbra,this.decay=t.decay,this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}}const vh=new kt,js=new L,aa=new L;class Lv extends Dl{constructor(){super(new Ke(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new zt(4,2),this._viewportCount=6,this._viewports=[new ee(2,1,1,1),new ee(0,1,1,1),new ee(3,1,1,1),new ee(1,1,1,1),new ee(3,0,1,1),new ee(1,0,1,1)],this._cubeDirections=[new L(1,0,0),new L(-1,0,0),new L(0,0,1),new L(0,0,-1),new L(0,1,0),new L(0,-1,0)],this._cubeUps=[new L(0,1,0),new L(0,1,0),new L(0,1,0),new L(0,1,0),new L(0,0,1),new L(0,0,-1)]}updateMatrices(t,e=0){const n=this.camera,i=this.matrix,r=t.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),js.setFromMatrixPosition(t.matrixWorld),n.position.copy(js),aa.copy(n.position),aa.add(this._cubeDirections[e]),n.up.copy(this._cubeUps[e]),n.lookAt(aa),n.updateMatrixWorld(),i.makeTranslation(-js.x,-js.y,-js.z),vh.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(vh)}}class Bd extends _r{constructor(t,e,n=0,i=2){super(t,e),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new Lv}get power(){return this.intensity*4*Math.PI}set power(t){this.intensity=t/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.decay=t.decay,this.shadow=t.shadow.clone(),this}}class Dv extends Dl{constructor(){super(new So(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class ol extends _r{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(ve.DEFAULT_UP),this.updateMatrix(),this.target=new ve,this.shadow=new Dv}dispose(){this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}}class Nv extends _r{constructor(t,e){super(t,e),this.isAmbientLight=!0,this.type="AmbientLight"}}class or{static decodeText(t){if(console.warn("THREE.LoaderUtils: decodeText() has been deprecated with r165 and will be removed with r175. Use TextDecoder instead."),typeof TextDecoder<"u")return new TextDecoder().decode(t);let e="";for(let n=0,i=t.length;n<i;n++)e+=String.fromCharCode(t[n]);try{return decodeURIComponent(escape(e))}catch{return e}}static extractUrlBase(t){const e=t.lastIndexOf("/");return e===-1?"./":t.slice(0,e+1)}static resolveURL(t,e){return typeof t!="string"||t===""?"":(/^https?:\/\//i.test(e)&&/^\//.test(t)&&(e=e.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(t)||/^data:.*,.*$/i.test(t)||/^blob:.*$/i.test(t)?t:e+t)}}class Uv extends Hs{constructor(t){super(t),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"}}setOptions(t){return this.options=t,this}load(t,e,n,i){t===void 0&&(t=""),this.path!==void 0&&(t=this.path+t),t=this.manager.resolveURL(t);const r=this,o=wi.get(t);if(o!==void 0){if(r.manager.itemStart(t),o.then){o.then(c=>{e&&e(c),r.manager.itemEnd(t)}).catch(c=>{i&&i(c)});return}return setTimeout(function(){e&&e(o),r.manager.itemEnd(t)},0),o}const a={};a.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",a.headers=this.requestHeader;const l=fetch(t,a).then(function(c){return c.blob()}).then(function(c){return createImageBitmap(c,Object.assign(r.options,{colorSpaceConversion:"none"}))}).then(function(c){return wi.add(t,c),e&&e(c),r.manager.itemEnd(t),c}).catch(function(c){i&&i(c),wi.remove(t),r.manager.itemError(t),r.manager.itemEnd(t)});wi.add(t,l),r.manager.itemStart(t)}}class kv{constructor(t,e,n){this.binding=t,this.valueSize=n;let i,r,o;switch(e){case"quaternion":i=this._slerp,r=this._slerpAdditive,o=this._setAdditiveIdentityQuaternion,this.buffer=new Float64Array(n*6),this._workIndex=5;break;case"string":case"bool":i=this._select,r=this._select,o=this._setAdditiveIdentityOther,this.buffer=new Array(n*5);break;default:i=this._lerp,r=this._lerpAdditive,o=this._setAdditiveIdentityNumeric,this.buffer=new Float64Array(n*5)}this._mixBufferRegion=i,this._mixBufferRegionAdditive=r,this._setIdentity=o,this._origIndex=3,this._addIndex=4,this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,this.useCount=0,this.referenceCount=0}accumulate(t,e){const n=this.buffer,i=this.valueSize,r=t*i+i;let o=this.cumulativeWeight;if(o===0){for(let a=0;a!==i;++a)n[r+a]=n[a];o=e}else{o+=e;const a=e/o;this._mixBufferRegion(n,r,0,a,i)}this.cumulativeWeight=o}accumulateAdditive(t){const e=this.buffer,n=this.valueSize,i=n*this._addIndex;this.cumulativeWeightAdditive===0&&this._setIdentity(),this._mixBufferRegionAdditive(e,i,0,t,n),this.cumulativeWeightAdditive+=t}apply(t){const e=this.valueSize,n=this.buffer,i=t*e+e,r=this.cumulativeWeight,o=this.cumulativeWeightAdditive,a=this.binding;if(this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,r<1){const l=e*this._origIndex;this._mixBufferRegion(n,i,l,1-r,e)}o>0&&this._mixBufferRegionAdditive(n,i,this._addIndex*e,1,e);for(let l=e,c=e+e;l!==c;++l)if(n[l]!==n[l+e]){a.setValue(n,i);break}}saveOriginalState(){const t=this.binding,e=this.buffer,n=this.valueSize,i=n*this._origIndex;t.getValue(e,i);for(let r=n,o=i;r!==o;++r)e[r]=e[i+r%n];this._setIdentity(),this.cumulativeWeight=0,this.cumulativeWeightAdditive=0}restoreOriginalState(){const t=this.valueSize*3;this.binding.setValue(this.buffer,t)}_setAdditiveIdentityNumeric(){const t=this._addIndex*this.valueSize,e=t+this.valueSize;for(let n=t;n<e;n++)this.buffer[n]=0}_setAdditiveIdentityQuaternion(){this._setAdditiveIdentityNumeric(),this.buffer[this._addIndex*this.valueSize+3]=1}_setAdditiveIdentityOther(){const t=this._origIndex*this.valueSize,e=this._addIndex*this.valueSize;for(let n=0;n<this.valueSize;n++)this.buffer[e+n]=this.buffer[t+n]}_select(t,e,n,i,r){if(i>=.5)for(let o=0;o!==r;++o)t[e+o]=t[n+o]}_slerp(t,e,n,i){Sn.slerpFlat(t,e,t,e,t,n,i)}_slerpAdditive(t,e,n,i,r){const o=this._workIndex*r;Sn.multiplyQuaternionsFlat(t,o,t,e,t,n),Sn.slerpFlat(t,e,t,e,t,o,i)}_lerp(t,e,n,i,r){const o=1-i;for(let a=0;a!==r;++a){const l=e+a;t[l]=t[l]*o+t[n+a]*i}}_lerpAdditive(t,e,n,i,r){for(let o=0;o!==r;++o){const a=e+o;t[a]=t[a]+t[n+o]*i}}}const Nl="\\[\\]\\.:\\/",Fv=new RegExp("["+Nl+"]","g"),Ul="[^"+Nl+"]",Ov="[^"+Nl.replace("\\.","")+"]",Bv=/((?:WC+[\/:])*)/.source.replace("WC",Ul),Hv=/(WCOD+)?/.source.replace("WCOD",Ov),Gv=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Ul),zv=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Ul),Vv=new RegExp("^"+Bv+Hv+Gv+zv+"$"),Wv=["material","materials","bones","map"];class Xv{constructor(t,e,n){const i=n||se.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,i)}getValue(t,e){this.bind();const n=this._targetGroup.nCachedObjects_,i=this._bindings[n];i!==void 0&&i.getValue(t,e)}setValue(t,e){const n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,r=n.length;i!==r;++i)n[i].setValue(t,e)}bind(){const t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].bind()}unbind(){const t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].unbind()}}class se{constructor(t,e,n){this.path=e,this.parsedPath=n||se.parseTrackName(e),this.node=se.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,n){return t&&t.isAnimationObjectGroup?new se.Composite(t,e,n):new se(t,e,n)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(Fv,"")}static parseTrackName(t){const e=Vv.exec(t);if(e===null)throw new Error("PropertyBinding: Cannot parse trackName: "+t);const n={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){const r=n.nodeName.substring(i+1);Wv.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,i),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+t);return n}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){const n=t.skeleton.getBoneByName(e);if(n!==void 0)return n}if(t.children){const n=function(r){for(let o=0;o<r.length;o++){const a=r[o];if(a.name===e||a.uuid===e)return a;const l=n(a.children);if(l)return l}return null},i=n(t.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)t[e++]=n[i]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=t[e++]}_setValue_array_setNeedsUpdate(t,e){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node;const e=this.parsedPath,n=e.objectName,i=e.propertyName;let r=e.propertyIndex;if(t||(t=se.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=e.objectIndex;switch(n){case"materials":if(!t.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let h=0;h<t.length;h++)if(t[h].name===c){c=h;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[n]}if(c!==void 0){if(t[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}const o=t[i];if(o===void 0){const c=e.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+i+" but it wasn't found.",t);return}let a=this.Versioning.None;this.targetObject=t,t.needsUpdate!==void 0?a=this.Versioning.NeedsUpdate:t.matrixWorldNeedsUpdate!==void 0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(i==="morphTargetInfluences"){if(!t.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}se.Composite=Xv;se.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};se.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};se.prototype.GetterByBindingType=[se.prototype._getValue_direct,se.prototype._getValue_array,se.prototype._getValue_arrayElement,se.prototype._getValue_toArray];se.prototype.SetterByBindingTypeAndVersioning=[[se.prototype._setValue_direct,se.prototype._setValue_direct_setNeedsUpdate,se.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[se.prototype._setValue_array,se.prototype._setValue_array_setNeedsUpdate,se.prototype._setValue_array_setMatrixWorldNeedsUpdate],[se.prototype._setValue_arrayElement,se.prototype._setValue_arrayElement_setNeedsUpdate,se.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[se.prototype._setValue_fromArray,se.prototype._setValue_fromArray_setNeedsUpdate,se.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];class Yv{constructor(t,e,n=null,i=e.blendMode){this._mixer=t,this._clip=e,this._localRoot=n,this.blendMode=i;const r=e.tracks,o=r.length,a=new Array(o),l={endingStart:ms,endingEnd:ms};for(let c=0;c!==o;++c){const h=r[c].createInterpolant(null);a[c]=h,h.settings=l}this._interpolantSettings=l,this._interpolants=a,this._propertyBindings=new Array(o),this._cacheIndex=null,this._byClipCacheIndex=null,this._timeScaleInterpolant=null,this._weightInterpolant=null,this.loop=dd,this._loopCount=-1,this._startTime=null,this.time=0,this.timeScale=1,this._effectiveTimeScale=1,this.weight=1,this._effectiveWeight=1,this.repetitions=1/0,this.paused=!1,this.enabled=!0,this.clampWhenFinished=!1,this.zeroSlopeAtStart=!0,this.zeroSlopeAtEnd=!0}play(){return this._mixer._activateAction(this),this}stop(){return this._mixer._deactivateAction(this),this.reset()}reset(){return this.paused=!1,this.enabled=!0,this.time=0,this._loopCount=-1,this._startTime=null,this.stopFading().stopWarping()}isRunning(){return this.enabled&&!this.paused&&this.timeScale!==0&&this._startTime===null&&this._mixer._isActiveAction(this)}isScheduled(){return this._mixer._isActiveAction(this)}startAt(t){return this._startTime=t,this}setLoop(t,e){return this.loop=t,this.repetitions=e,this}setEffectiveWeight(t){return this.weight=t,this._effectiveWeight=this.enabled?t:0,this.stopFading()}getEffectiveWeight(){return this._effectiveWeight}fadeIn(t){return this._scheduleFading(t,0,1)}fadeOut(t){return this._scheduleFading(t,1,0)}crossFadeFrom(t,e,n){if(t.fadeOut(e),this.fadeIn(e),n){const i=this._clip.duration,r=t._clip.duration,o=r/i,a=i/r;t.warp(1,o,e),this.warp(a,1,e)}return this}crossFadeTo(t,e,n){return t.crossFadeFrom(this,e,n)}stopFading(){const t=this._weightInterpolant;return t!==null&&(this._weightInterpolant=null,this._mixer._takeBackControlInterpolant(t)),this}setEffectiveTimeScale(t){return this.timeScale=t,this._effectiveTimeScale=this.paused?0:t,this.stopWarping()}getEffectiveTimeScale(){return this._effectiveTimeScale}setDuration(t){return this.timeScale=this._clip.duration/t,this.stopWarping()}syncWith(t){return this.time=t.time,this.timeScale=t.timeScale,this.stopWarping()}halt(t){return this.warp(this._effectiveTimeScale,0,t)}warp(t,e,n){const i=this._mixer,r=i.time,o=this.timeScale;let a=this._timeScaleInterpolant;a===null&&(a=i._lendControlInterpolant(),this._timeScaleInterpolant=a);const l=a.parameterPositions,c=a.sampleValues;return l[0]=r,l[1]=r+n,c[0]=t/o,c[1]=e/o,this}stopWarping(){const t=this._timeScaleInterpolant;return t!==null&&(this._timeScaleInterpolant=null,this._mixer._takeBackControlInterpolant(t)),this}getMixer(){return this._mixer}getClip(){return this._clip}getRoot(){return this._localRoot||this._mixer._root}_update(t,e,n,i){if(!this.enabled){this._updateWeight(t);return}const r=this._startTime;if(r!==null){const l=(t-r)*n;l<0||n===0?e=0:(this._startTime=null,e=n*l)}e*=this._updateTimeScale(t);const o=this._updateTime(e),a=this._updateWeight(t);if(a>0){const l=this._interpolants,c=this._propertyBindings;switch(this.blendMode){case xf:for(let h=0,d=l.length;h!==d;++h)l[h].evaluate(o),c[h].accumulateAdditive(a);break;case bl:default:for(let h=0,d=l.length;h!==d;++h)l[h].evaluate(o),c[h].accumulate(i,a)}}}_updateWeight(t){let e=0;if(this.enabled){e=this.weight;const n=this._weightInterpolant;if(n!==null){const i=n.evaluate(t)[0];e*=i,t>n.parameterPositions[1]&&(this.stopFading(),i===0&&(this.enabled=!1))}}return this._effectiveWeight=e,e}_updateTimeScale(t){let e=0;if(!this.paused){e=this.timeScale;const n=this._timeScaleInterpolant;if(n!==null){const i=n.evaluate(t)[0];e*=i,t>n.parameterPositions[1]&&(this.stopWarping(),e===0?this.paused=!0:this.timeScale=e)}}return this._effectiveTimeScale=e,e}_updateTime(t){const e=this._clip.duration,n=this.loop;let i=this.time+t,r=this._loopCount;const o=n===vf;if(t===0)return r===-1?i:o&&(r&1)===1?e-i:i;if(n===hd){r===-1&&(this._loopCount=0,this._setEndings(!0,!0,!1));t:{if(i>=e)i=e;else if(i<0)i=0;else{this.time=i;break t}this.clampWhenFinished?this.paused=!0:this.enabled=!1,this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:t<0?-1:1})}}else{if(r===-1&&(t>=0?(r=0,this._setEndings(!0,this.repetitions===0,o)):this._setEndings(this.repetitions===0,!0,o)),i>=e||i<0){const a=Math.floor(i/e);i-=e*a,r+=Math.abs(a);const l=this.repetitions-r;if(l<=0)this.clampWhenFinished?this.paused=!0:this.enabled=!1,i=t>0?e:0,this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:t>0?1:-1});else{if(l===1){const c=t<0;this._setEndings(c,!c,o)}else this._setEndings(!1,!1,o);this._loopCount=r,this.time=i,this._mixer.dispatchEvent({type:"loop",action:this,loopDelta:a})}}else this.time=i;if(o&&(r&1)===1)return e-i}return i}_setEndings(t,e,n){const i=this._interpolantSettings;n?(i.endingStart=gs,i.endingEnd=gs):(t?i.endingStart=this.zeroSlopeAtStart?gs:ms:i.endingStart=ro,e?i.endingEnd=this.zeroSlopeAtEnd?gs:ms:i.endingEnd=ro)}_scheduleFading(t,e,n){const i=this._mixer,r=i.time;let o=this._weightInterpolant;o===null&&(o=i._lendControlInterpolant(),this._weightInterpolant=o);const a=o.parameterPositions,l=o.sampleValues;return a[0]=r,l[0]=e,a[1]=r+t,l[1]=n,this}}const qv=new Float32Array(1);class $v extends Ki{constructor(t){super(),this._root=t,this._initMemoryManager(),this._accuIndex=0,this.time=0,this.timeScale=1}_bindAction(t,e){const n=t._localRoot||this._root,i=t._clip.tracks,r=i.length,o=t._propertyBindings,a=t._interpolants,l=n.uuid,c=this._bindingsByRootAndName;let h=c[l];h===void 0&&(h={},c[l]=h);for(let d=0;d!==r;++d){const u=i[d],f=u.name;let g=h[f];if(g!==void 0)++g.referenceCount,o[d]=g;else{if(g=o[d],g!==void 0){g._cacheIndex===null&&(++g.referenceCount,this._addInactiveBinding(g,l,f));continue}const _=e&&e._propertyBindings[d].binding.parsedPath;g=new kv(se.create(n,f,_),u.ValueTypeName,u.getValueSize()),++g.referenceCount,this._addInactiveBinding(g,l,f),o[d]=g}a[d].resultBuffer=g.buffer}}_activateAction(t){if(!this._isActiveAction(t)){if(t._cacheIndex===null){const n=(t._localRoot||this._root).uuid,i=t._clip.uuid,r=this._actionsByClip[i];this._bindAction(t,r&&r.knownActions[0]),this._addInactiveAction(t,i,n)}const e=t._propertyBindings;for(let n=0,i=e.length;n!==i;++n){const r=e[n];r.useCount++===0&&(this._lendBinding(r),r.saveOriginalState())}this._lendAction(t)}}_deactivateAction(t){if(this._isActiveAction(t)){const e=t._propertyBindings;for(let n=0,i=e.length;n!==i;++n){const r=e[n];--r.useCount===0&&(r.restoreOriginalState(),this._takeBackBinding(r))}this._takeBackAction(t)}}_initMemoryManager(){this._actions=[],this._nActiveActions=0,this._actionsByClip={},this._bindings=[],this._nActiveBindings=0,this._bindingsByRootAndName={},this._controlInterpolants=[],this._nActiveControlInterpolants=0;const t=this;this.stats={actions:{get total(){return t._actions.length},get inUse(){return t._nActiveActions}},bindings:{get total(){return t._bindings.length},get inUse(){return t._nActiveBindings}},controlInterpolants:{get total(){return t._controlInterpolants.length},get inUse(){return t._nActiveControlInterpolants}}}}_isActiveAction(t){const e=t._cacheIndex;return e!==null&&e<this._nActiveActions}_addInactiveAction(t,e,n){const i=this._actions,r=this._actionsByClip;let o=r[e];if(o===void 0)o={knownActions:[t],actionByRoot:{}},t._byClipCacheIndex=0,r[e]=o;else{const a=o.knownActions;t._byClipCacheIndex=a.length,a.push(t)}t._cacheIndex=i.length,i.push(t),o.actionByRoot[n]=t}_removeInactiveAction(t){const e=this._actions,n=e[e.length-1],i=t._cacheIndex;n._cacheIndex=i,e[i]=n,e.pop(),t._cacheIndex=null;const r=t._clip.uuid,o=this._actionsByClip,a=o[r],l=a.knownActions,c=l[l.length-1],h=t._byClipCacheIndex;c._byClipCacheIndex=h,l[h]=c,l.pop(),t._byClipCacheIndex=null;const d=a.actionByRoot,u=(t._localRoot||this._root).uuid;delete d[u],l.length===0&&delete o[r],this._removeInactiveBindingsForAction(t)}_removeInactiveBindingsForAction(t){const e=t._propertyBindings;for(let n=0,i=e.length;n!==i;++n){const r=e[n];--r.referenceCount===0&&this._removeInactiveBinding(r)}}_lendAction(t){const e=this._actions,n=t._cacheIndex,i=this._nActiveActions++,r=e[i];t._cacheIndex=i,e[i]=t,r._cacheIndex=n,e[n]=r}_takeBackAction(t){const e=this._actions,n=t._cacheIndex,i=--this._nActiveActions,r=e[i];t._cacheIndex=i,e[i]=t,r._cacheIndex=n,e[n]=r}_addInactiveBinding(t,e,n){const i=this._bindingsByRootAndName,r=this._bindings;let o=i[e];o===void 0&&(o={},i[e]=o),o[n]=t,t._cacheIndex=r.length,r.push(t)}_removeInactiveBinding(t){const e=this._bindings,n=t.binding,i=n.rootNode.uuid,r=n.path,o=this._bindingsByRootAndName,a=o[i],l=e[e.length-1],c=t._cacheIndex;l._cacheIndex=c,e[c]=l,e.pop(),delete a[r],Object.keys(a).length===0&&delete o[i]}_lendBinding(t){const e=this._bindings,n=t._cacheIndex,i=this._nActiveBindings++,r=e[i];t._cacheIndex=i,e[i]=t,r._cacheIndex=n,e[n]=r}_takeBackBinding(t){const e=this._bindings,n=t._cacheIndex,i=--this._nActiveBindings,r=e[i];t._cacheIndex=i,e[i]=t,r._cacheIndex=n,e[n]=r}_lendControlInterpolant(){const t=this._controlInterpolants,e=this._nActiveControlInterpolants++;let n=t[e];return n===void 0&&(n=new Ud(new Float32Array(2),new Float32Array(2),1,qv),n.__cacheIndex=e,t[e]=n),n}_takeBackControlInterpolant(t){const e=this._controlInterpolants,n=t.__cacheIndex,i=--this._nActiveControlInterpolants,r=e[i];t.__cacheIndex=i,e[i]=t,r.__cacheIndex=n,e[n]=r}clipAction(t,e,n){const i=e||this._root,r=i.uuid;let o=typeof t=="string"?rl.findByName(i,t):t;const a=o!==null?o.uuid:t,l=this._actionsByClip[a];let c=null;if(n===void 0&&(o!==null?n=o.blendMode:n=bl),l!==void 0){const d=l.actionByRoot[r];if(d!==void 0&&d.blendMode===n)return d;c=l.knownActions[0],o===null&&(o=c._clip)}if(o===null)return null;const h=new Yv(this,o,e,n);return this._bindAction(h,c),this._addInactiveAction(h,a,r),h}existingAction(t,e){const n=e||this._root,i=n.uuid,r=typeof t=="string"?rl.findByName(n,t):t,o=r?r.uuid:t,a=this._actionsByClip[o];return a!==void 0&&a.actionByRoot[i]||null}stopAllAction(){const t=this._actions,e=this._nActiveActions;for(let n=e-1;n>=0;--n)t[n].stop();return this}update(t){t*=this.timeScale;const e=this._actions,n=this._nActiveActions,i=this.time+=t,r=Math.sign(t),o=this._accuIndex^=1;for(let c=0;c!==n;++c)e[c]._update(i,t,r,o);const a=this._bindings,l=this._nActiveBindings;for(let c=0;c!==l;++c)a[c].apply(o);return this}setTime(t){this.time=0;for(let e=0;e<this._actions.length;e++)this._actions[e].time=0;return this.update(t)}getRoot(){return this._root}uncacheClip(t){const e=this._actions,n=t.uuid,i=this._actionsByClip,r=i[n];if(r!==void 0){const o=r.knownActions;for(let a=0,l=o.length;a!==l;++a){const c=o[a];this._deactivateAction(c);const h=c._cacheIndex,d=e[e.length-1];c._cacheIndex=null,c._byClipCacheIndex=null,d._cacheIndex=h,e[h]=d,e.pop(),this._removeInactiveBindingsForAction(c)}delete i[n]}}uncacheRoot(t){const e=t.uuid,n=this._actionsByClip;for(const o in n){const a=n[o].actionByRoot,l=a[e];l!==void 0&&(this._deactivateAction(l),this._removeInactiveAction(l))}const i=this._bindingsByRootAndName,r=i[e];if(r!==void 0)for(const o in r){const a=r[o];a.restoreOriginalState(),this._removeInactiveBinding(a)}}uncacheAction(t,e){const n=this.existingAction(t,e);n!==null&&(this._deactivateAction(n),this._removeInactiveAction(n))}}const xh=new kt;class Kv{constructor(t,e,n=0,i=1/0){this.ray=new pr(t,e),this.near=n,this.far=i,this.camera=null,this.layers=new Al,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,(e.near+e.far)/(e.near-e.far)).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):console.error("THREE.Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return xh.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(xh),this}intersectObject(t,e=!0,n=[]){return al(t,this,n,e),n.sort(yh),n}intersectObjects(t,e=!0,n=[]){for(let i=0,r=t.length;i<r;i++)al(t[i],this,n,e);return n.sort(yh),n}}function yh(s,t){return s.distance-t.distance}function al(s,t,e,n){let i=!0;if(s.layers.test(t.layers)&&s.raycast(t,e)===!1&&(i=!1),i===!0&&n===!0){const r=s.children;for(let o=0,a=r.length;o<a;o++)al(r[o],t,e,!0)}}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:gl}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=gl);function vi(s,t){return s.x===t.x&&s.y===t.y}function jv(s,t,e){var a,l,c,h;const n=((a=s.obstacleHits[0])==null?void 0:a.distance)??1/0,i=s.tileHits[0],r=(i==null?void 0:i.distance)??1/0,o=d=>{var u;for(const f of s.unitHits){if(f.distance>=n)break;const g=(u=f.userData)==null?void 0:u.unitId;if(!g||!d.has(g))continue;const _=t.find(m=>m.id===g&&m.alive);if(_)return _}return null};if(e.mode==="attack"){const d=o(e.attackableIds);if(d)return{unitId:d.id,cell:d.pos};if(i&&r<n){const u=(l=i.userData)==null?void 0:l.gridCoord;if(u){const f=t.find(g=>g.alive&&e.attackableIds.has(g.id)&&vi(g.pos,u));if(f)return{unitId:f.id,cell:f.pos}}}return{unitId:null,cell:null}}if(e.mode==="skill"){if(e.healTargetUnitIds){const d=o(e.healTargetUnitIds);if(d)return{unitId:d.id,cell:d.pos}}else if(e.skillTargetUnitIds&&e.skillTargetUnitIds.size>0){const d=o(e.skillTargetUnitIds);if(d)return{unitId:d.id,cell:d.pos}}return i&&r<n?{unitId:null,cell:((c=i.userData)==null?void 0:c.gridCoord)??null}:{unitId:null,cell:null}}if(e.canBasicAttack){const d=o(e.attackableIds);if(d)return{unitId:d.id,cell:d.pos}}return i&&r<n?{unitId:null,cell:((h=i.userData)==null?void 0:h.gridCoord)??null}:{unitId:null,cell:null}}function la(s){return s.map(t=>({distance:t.distance,userData:t.object.userData}))}class Zv{constructor(t,e,n,i,r,o,a=null){B(this,"canvas");B(this,"camera");B(this,"engine");B(this,"board");B(this,"unitRenderer");B(this,"callbacks");B(this,"cameraController");B(this,"raycaster",new Kv);B(this,"ndc",new zt);B(this,"lastHoverKey",null);B(this,"lastMode","default");B(this,"handlePointerMoveBound");B(this,"handlePointerDownBound");B(this,"handlePointerLeaveBound");B(this,"handleContextMenuBound");this.canvas=t,this.camera=e,this.engine=n,this.board=i,this.unitRenderer=r,this.callbacks=o,this.cameraController=a,this.handlePointerMoveBound=l=>this.onPointerMove(l),this.handlePointerDownBound=l=>this.onPointerDown(l),this.handlePointerLeaveBound=()=>this.onPointerLeave(),this.handleContextMenuBound=l=>{var c;l.preventDefault(),!((c=this.cameraController)!=null&&c.consumeRightDrag())&&this.callbacks.getMode()!=="default"&&(this.callbacks.setMode("default"),this.lastHoverKey=null,this.callbacks.onHoverChange(null,null,[]))},this.canvas.addEventListener("pointermove",this.handlePointerMoveBound),this.canvas.addEventListener("pointerdown",this.handlePointerDownBound),this.canvas.addEventListener("pointerleave",this.handlePointerLeaveBound),this.canvas.addEventListener("contextmenu",this.handleContextMenuBound)}isInputBlocked(){return this.engine.getState().phase!=="player"||this.unitRenderer.isAnimating}updateRaycaster(t){const e=this.canvas.getBoundingClientRect();this.ndc.x=(t.clientX-e.left)/e.width*2-1,this.ndc.y=-((t.clientY-e.top)/e.height)*2+1,this.raycaster.setFromCamera(this.ndc,this.camera)}buildPickContext(t){const e=this.engine.getState(),n=e.selectedUnitId?e.units.find(l=>l.id===e.selectedUnitId&&l.alive)??null:null,i=n?this.engine.getAttackableTargets():[],r=new Set(i.map(l=>l.id));let o,a;if(t==="skill"&&(n!=null&&n.skillId)){const l=ur[n.skillId],c=this.engine.getSkillTargetCells();l.targetTeam==="ally"?a=new Set(e.units.filter(h=>h.alive&&h.team==="player"&&c.some(d=>vi(d,h.pos))).map(h=>h.id)):l.area==="single"&&(o=new Set(e.units.filter(h=>h.alive&&h.team==="enemy"&&c.some(d=>vi(d,h.pos))).map(h=>h.id)))}return{units:e.units,context:{mode:t,canBasicAttack:!!(n&&!n.hasAttacked),attackableIds:r,skillTargetUnitIds:o,healTargetUnitIds:a}}}pickTarget(t,e){this.updateRaycaster(t);const{context:n,units:i}=this.buildPickContext(e),r={unitHits:la(this.raycaster.intersectObjects(this.unitRenderer.getUnitHitboxes(),!1)),obstacleHits:la(this.raycaster.intersectObjects(this.board.getObstacleMeshes(),!1)),tileHits:la(this.raycaster.intersectObjects(this.board.getTileMeshes(),!1))};return jv(r,i,n)}onPointerMove(t){var f;if((f=this.cameraController)!=null&&f.isDragging){this.canvas.style.cursor="grabbing";return}if(this.isInputBlocked()){this.lastHoverKey!==null&&(this.lastHoverKey=null,this.callbacks.onHoverChange(null,null,[])),this.canvas.style.cursor="default";return}const e=this.callbacks.getMode(),{unitId:n,cell:i}=this.pickTarget(t,e),r=i?`${i.x},${i.y}`:null,o=this.engine.getState(),a=o.selectedUnitId?o.units.find(g=>g.id===o.selectedUnitId&&g.alive)??null:null;if(e==="skill"){const g=a?this.engine.getSkillTargetCells():[],_=i?g.some(M=>vi(M,i)):!1,m=i&&a&&!_?this.engine.getSmartSkillPlan(i):null,p=_||m!==null;if(this.canvas.style.cursor=p?"pointer":"default",r===this.lastHoverKey&&e===this.lastMode)return;this.lastHoverKey=r,this.lastMode=e;const y=i&&p?this.engine.getSkillAreaCells(i):[];this.callbacks.onHoverChange(p?i:null,m&&m.path.length>=2?m.path:null,y);return}const l=a&&(n||i)?o.units.find(g=>g.team==="enemy"&&g.alive&&(n&&g.id===n||i&&vi(g.pos,i)))??null:null,c=l?this.engine.getSmartAttackPlan(l.id):null;if(e==="attack"){if(this.canvas.style.cursor=l?"pointer":"default",r===this.lastHoverKey&&e===this.lastMode)return;this.lastHoverKey=r,this.lastMode=e,this.callbacks.onHoverChange(l?l.pos:null,c&&c.path.length>=2?c.path:null,[]);return}const h=a?this.engine.getReachableCells():[],d=i?h.some(g=>vi(g,i)):!1;if(this.canvas.style.cursor=d||c!==null?"pointer":"default",r===this.lastHoverKey&&e===this.lastMode)return;this.lastHoverKey=r,this.lastMode=e;let u=null;c&&c.path.length>=2?u=c.path:i&&a&&d&&(u=this.engine.getPath(a.pos,i)),this.callbacks.onHoverChange(i,u,[])}onPointerDown(t){var o,a,l,c;if(t.button!==0||this.isInputBlocked())return;const e=this.callbacks.getMode(),{unitId:n,cell:i}=this.pickTarget(t,e),r=this.engine.getState();if(e==="skill"&&r.selectedUnitId&&i){const h=this.engine.smartUseSkill(i);if(h.ok){this.callbacks.setMode("default"),this.lastHoverKey=null,this.callbacks.onActionExecuted();return}(a=(o=this.callbacks).onFeedback)==null||a.call(o,h.reason);return}if(r.selectedUnitId){const h=r.units.find(d=>d.team==="enemy"&&d.alive&&(n&&d.id===n||i&&vi(d.pos,i)));if(h){const d=this.engine.smartAttack(h.id);d.ok?(this.callbacks.setMode("default"),this.lastHoverKey=null,this.callbacks.onActionExecuted()):(c=(l=this.callbacks).onFeedback)==null||c.call(l,d.reason);return}if(e==="attack"){this.callbacks.setMode("default"),this.lastHoverKey=null,this.callbacks.onActionExecuted();return}}if(i&&r.selectedUnitId&&this.engine.getReachableCells().some(d=>vi(d,i))){this.engine.moveSelectedUnit(i).ok&&(this.callbacks.setMode("default"),this.lastHoverKey=null,this.callbacks.onActionExecuted());return}}onPointerLeave(){this.lastHoverKey!==null&&(this.lastHoverKey=null,this.callbacks.onHoverChange(null,null,[])),this.canvas.style.cursor="default"}dispose(){this.canvas.removeEventListener("pointermove",this.handlePointerMoveBound),this.canvas.removeEventListener("pointerdown",this.handlePointerDownBound),this.canvas.removeEventListener("pointerleave",this.handlePointerLeaveBound),this.canvas.removeEventListener("contextmenu",this.handleContextMenuBound)}}const Mh=6.2,Sh=.45,wh=12.45/20;function bh(s,t,e,n,i,r){if(Math.abs(e)<1e-8)return s>n||t<-n?null:[i,r];let o=i,a=r;return e>0?(o=Math.max(o,(-n-t)/e),a=Math.min(a,(n-s)/e)):(o=Math.max(o,(n-s)/e),a=Math.min(a,(-n-t)/e)),o>a?null:[o,a]}function Jv(s,t){if(s.height<=Sh)return!1;const e=Math.sin(t),n=Math.cos(t);if(s.centerX*e+s.centerZ*n<=0)return!1;const r=-e/wh,o=-n/wh,a=bh(s.centerX-s.halfWidth,s.centerX+s.halfWidth,r,Mh,Sh,s.height);return a?bh(s.centerZ-s.halfDepth,s.centerZ+s.halfDepth,o,Mh,a[0],a[1])!==null:!1}function Qv(s,t){const e=new Set;for(const n of s)Jv(n,t)&&e.add(n.id);return e}function ii(s){let t=s>>>0;return()=>{t=t+1831565813>>>0;let e=Math.imul(t^t>>>15,1|t);return e=e+Math.imul(e^e>>>7,61|e)^e,((e^e>>>14)>>>0)/4294967296}}const Eh=()=>{};class Hd{constructor(){B(this,"geometries",new Set);B(this,"materials",new Set);B(this,"textures",new Set)}trackGeometry(t){return this.geometries.add(t),t}trackMaterial(t){return this.materials.add(t),t}trackTexture(t){return this.textures.add(t),t}markNoRaycast(t){t.traverse(e=>{e.isMesh&&(e.raycast=Eh)})}applyObstacleMetadata(t,e,n,i){const r={kind:"obstacle",obstacleKind:e,gridCoord:{x:n.x,y:n.y}};t.traverse(o=>{const a=o;a.isMesh&&a.raycast!==Eh&&(a.userData=r,i.push(a))})}dispose(){for(const t of this.geometries)t.dispose();this.geometries.clear();for(const t of this.materials)t.dispose();this.materials.clear();for(const t of this.textures)t.dispose();this.textures.clear()}}function Ln(s,t,e,n,i=0,r=0,o=0,a=0){const l=Math.abs(Math.cos(a)),c=Math.abs(Math.sin(a)),h=s*l+t*c,d=s*c+t*l;return{minX:i-h,maxX:i+h,minZ:o-d,maxZ:o+d,minY:r+e,maxY:r+n}}function si(s,t=s){const e=document.createElement("canvas");e.width=s,e.height=t;const n=e.getContext("2d");if(!n)throw new Error("Failed to acquire 2D context for procedural scenario texture.");return[e,n]}function ri(s,t,e=!0){const n=new _v(t);return n.colorSpace=be,e?(n.wrapS=ln,n.wrapT=ln):(n.wrapS=Cn,n.wrapT=Cn),n.needsUpdate=!0,s.trackTexture(n)}function Ms(s,t={}){const e=t.size??256,n=ii(t.seed??101),i=t.variant??"floor",r=t.baseColor??"#7c7b74",o=t.secondaryColor??"#66655e",a=t.mortarColor??"#3b3d39",l=t.mossColor??"#4a6b2f",c=t.mossAmount??.25,[h,d]=si(e);d.fillStyle=a,d.fillRect(0,0,e,e);const u=i==="floor"?4:6,f=i==="floor"?4:3,g=e/u,_=e/f,m=Math.max(2,Math.floor(e*.015));for(let p=0;p<u;p++){const y=i==="masonry"&&p%2===1?_*.5:0;for(let M=-1;M<=f;M++){const v=M*_+y+m*.5,I=p*g+m*.5,T=_-m,E=g-m;d.fillStyle=n()>.45?r:o,d.fillRect(v,I,T,E),d.fillStyle="rgba(255,255,255,0.08)",d.fillRect(v+1,I+1,T-2,3),d.fillStyle="rgba(0,0,0,0.12)",d.fillRect(v+1,I+E-3,T-2,2);const C=6;for(let S=0;S<C;S++){const x=v+n()*(T-4)+2,P=I+n()*(E-4)+2;d.fillStyle=n()>.5?"rgba(0,0,0,0.14)":"rgba(255,255,255,0.06)",d.fillRect(x,P,2+n()*4,2+n()*3)}}}if(c>0){const p=Math.floor(42*c);d.fillStyle=l;for(let y=0;y<p;y++){const M=n()*e,v=n()*e,I=3+n()*9;d.globalAlpha=.35+n()*.35,d.beginPath(),d.arc(M,v,I,0,Math.PI*2),d.fill()}d.globalAlpha=1}return ri(s,h,!0)}function Gd(s,t={}){const e=t.size??256,n=ii(t.seed??202),i=t.baseColor??"#4a6b2f",r=t.highlightColor??"#63883e",o=t.earthColor??"#344723",[a,l]=si(e);l.fillStyle=i,l.fillRect(0,0,e,e);for(let c=0;c<140;c++){const h=n()*e,d=n()*e,u=4+n()*16;l.fillStyle=n()>.45?o:r,l.globalAlpha=.25+n()*.35,l.beginPath(),l.arc(h,d,u,0,Math.PI*2),l.fill()}l.globalAlpha=1;for(let c=0;c<90;c++){const h=n()*e,d=n()*e;l.fillStyle=n()>.5?"#759c4a":"#2a3d1c",l.fillRect(h,d,2,4)}return ri(s,a,!0)}function zd(s,t={}){const e=t.size??256,n=ii(t.seed??303),i=t.baseColor??"#6b472b",r=t.grainColor??"#462c18",o=t.planks??5,[a,l]=si(e);l.fillStyle=i,l.fillRect(0,0,e,e);const c=e/o;for(let h=0;h<o;h++){const d=h*c;l.fillStyle=h%2===0?"rgba(255,255,255,0.04)":"rgba(0,0,0,0.06)",l.fillRect(d,0,c,e),l.fillStyle="#24150b",l.fillRect(d,0,2,e),l.fillStyle=r;for(let u=0;u<6;u++){const f=d+4+n()*Math.max(4,c-8);l.globalAlpha=.28+n()*.25,l.fillRect(f,0,1.5,e)}l.globalAlpha=1,l.fillStyle="#1f2329",l.fillRect(d+5,10,3,3),l.fillRect(d+c-8,10,3,3),l.fillRect(d+5,e-13,3,3),l.fillRect(d+c-8,e-13,3,3)}return ri(s,a,!0)}function tx(s,t={}){const e=t.size??128,n=e*2,i=t.emblem??"sword",r=t.clothColor??"#8f1d22",o=t.trimColor??"#d4a24c",a=t.emblemColor??"#e7dfd1",[l,c]=si(e,n);c.clearRect(0,0,e,n),c.fillStyle=r,c.beginPath(),c.moveTo(0,0),c.lineTo(e,0),c.lineTo(e,n*.96),c.lineTo(e*.5,n*.8),c.lineTo(0,n*.96),c.closePath(),c.fill();const h=c.createLinearGradient(0,0,e,0);h.addColorStop(0,"rgba(0,0,0,0.22)"),h.addColorStop(.35,"rgba(255,255,255,0.08)"),h.addColorStop(.65,"rgba(0,0,0,0.12)"),h.addColorStop(1,"rgba(0,0,0,0.25)"),c.fillStyle=h,c.fill(),c.strokeStyle=o,c.lineWidth=Math.max(3,e*.05),c.strokeRect(e*.08,n*.04,e*.84,n*.72),c.fillStyle=a,c.strokeStyle=a;const d=e*.5,u=n*.4;return i==="sword"?(c.fillRect(d-e*.04,u-n*.18,e*.08,n*.28),c.fillRect(d-e*.16,u+n*.04,e*.32,n*.035),c.beginPath(),c.moveTo(d,u-n*.24),c.lineTo(d-e*.06,u-n*.17),c.lineTo(d+e*.06,u-n*.17),c.closePath(),c.fill()):i==="tree"?(c.fillRect(d-e*.035,u+n*.02,e*.07,n*.14),c.beginPath(),c.arc(d,u-n*.05,e*.2,0,Math.PI*2),c.arc(d-e*.12,u+n*.01,e*.12,0,Math.PI*2),c.arc(d+e*.12,u+n*.01,e*.12,0,Math.PI*2),c.fill()):(c.lineWidth=Math.max(3,e*.045),c.beginPath(),c.moveTo(d,u-n*.18),c.lineTo(d+e*.15,u),c.lineTo(d,u+n*.18),c.lineTo(d-e*.15,u),c.closePath(),c.stroke(),c.beginPath(),c.moveTo(d,u-n*.18),c.lineTo(d,u+n*.18),c.stroke()),ri(s,l,!1)}function kl(s,t={}){const e=t.size??256,n=ii(t.seed??404),i=t.baseColor??"#1b3b3a",r=t.rippleColor??"#3b7470",o=t.deepColor??"#112726",[a,l]=si(e);l.fillStyle=i,l.fillRect(0,0,e,e);for(let c=0;c<45;c++){const h=n()*e,d=n()*e,u=10+n()*24;l.fillStyle=o,l.globalAlpha=.28,l.beginPath(),l.arc(h,d,u,0,Math.PI*2),l.fill()}l.strokeStyle=r,l.lineWidth=2;for(let c=0;c<36;c++){const h=n()*e,d=n()*e,u=14+n()*26;l.globalAlpha=.25+n()*.25,l.beginPath(),l.moveTo(h,d),l.quadraticCurveTo(h+u*.5,d-4,h+u,d),l.stroke()}return l.globalAlpha=1,ri(s,a,!0)}function ex(s,t={}){const e=t.size??256,n=ii(t.seed??505),i=t.baseColor??"#9a3e2e",r=t.darkColor??"#73281d",[o,a]=si(e);a.fillStyle=r,a.fillRect(0,0,e,e);const l=8,c=6,h=e/l,d=e/c;for(let u=0;u<l;u++){const f=u%2===1?d*.5:0;for(let g=-1;g<=c;g++){const _=g*d+f,m=u*h;a.fillStyle=n()>.35?i:"#883325",a.beginPath(),a.roundRect(_+2,m+2,d-4,h-3,[2,2,8,8]),a.fill()}}return ri(s,o,!0)}function nx(s,t={}){const e=t.size??256,n=t.stoneColor??"#5d6968",i=t.engravingColor??"#2f3838",r=t.runeColor??"#7dd3fc",[o,a]=si(e);a.fillStyle=n,a.fillRect(0,0,e,e);const l=e*.5,c=e*.5;a.strokeStyle=i,a.lineWidth=6,a.beginPath(),a.arc(l,c,e*.44,0,Math.PI*2),a.stroke(),a.lineWidth=3,a.beginPath(),a.arc(l,c,e*.31,0,Math.PI*2),a.stroke();for(let h=0;h<8;h++){const d=h*Math.PI/4;a.beginPath(),a.moveTo(l+Math.cos(d)*e*.14,c+Math.sin(d)*e*.14),a.lineTo(l+Math.cos(d)*e*.42,c+Math.sin(d)*e*.42),a.stroke()}return a.strokeStyle=r,a.globalAlpha=.35,a.lineWidth=2.5,a.beginPath(),a.arc(l,c,e*.2,0,Math.PI*2),a.stroke(),a.globalAlpha=1,ri(s,o,!1)}function Vd(s,t="rgba(186, 214, 218, 0.45)",e=128){const[n,i]=si(e),r=e*.5,o=i.createRadialGradient(r,r,e*.05,r,r,r);return o.addColorStop(0,t),o.addColorStop(.55,"rgba(148, 184, 190, 0.18)"),o.addColorStop(1,"rgba(148, 184, 190, 0)"),i.fillStyle=o,i.fillRect(0,0,e,e),ri(s,n,!1)}function ix(s,t={}){const e=t.size??512,n=256,[i,r]=si(e,n),o=r.createLinearGradient(0,0,0,n);return o.addColorStop(0,t.topColor??"#162036"),o.addColorStop(.45,t.midColor??"#283b5c"),o.addColorStop(.72,t.horizonColor??"#555d78"),o.addColorStop(1,t.groundColor??"#1a2230"),r.fillStyle=o,r.fillRect(0,0,e,n),ri(s,i,!1)}function le(s,t){return s.trackMaterial(new et({roughness:.85,metalness:.05,...t}))}function _t(s,t,e,n,i,r,o,a,l,c=!0,h=!0){const d=new R(s.trackGeometry(new Q(e,n,i)),r);return d.position.set(o,a,l),d.castShadow=c,d.receiveShadow=h,t.add(d),d}function oi(s=0,t=0,e=0,n=0){const i=new Tt;i.position.set(s,t,e),i.rotation.y=n;const r=new Tt,o=new Tt;return i.add(r,o),{root:i,baseGroup:r,upperGroup:o}}function qn(s,t={}){const e=t.length??2.4,n=t.height??1.8,i=t.thickness??.55,r=Math.min(.45,n),o=t.stoneMat??le(s,{color:8091760}),a=t.mossMat??le(s,{color:4877103}),{root:l,baseGroup:c,upperGroup:h}=oi(t.worldX,t.worldY,t.worldZ,t.rotationY);_t(s,c,e,r,i+.08,o,0,r*.5,0);const d=Math.max(.1,n-r);if(_t(s,h,e,d,i,o,0,r+d*.5,0),t.crenellations!==!1){const g=Math.max(2,Math.floor(e/.65)),_=e/g;for(let m=0;m<g;m++){const p=-e*.5+_*(m+.5);_t(s,h,_*.55,.32,i*.88,o,p,n+.16,0)}}if(t.moss){const g=_t(s,h,e*.42,.16,i+.04,a,-e*.18,n*.72,0,!1,!0);s.markNoRaycast(g)}const u=t.crenellations!==!1?n+.32:n,f=Ln(e*.5,(i+.08)*.5,0,u,t.worldX,t.worldY,t.worldZ,t.rotationY);return{root:l,baseGroup:c,upperGroup:h,bounds:f,animated:[]}}function sx(s,t={}){const e=t.openingWidth??2.1,n=t.height??2.8,i=t.stoneMat??le(s,{color:8289139}),r=t.ironMat??le(s,{color:2830136,metalness:.6,roughness:.45}),o=1.05,a=1.15,l=e+o*2,c=.45,{root:h,baseGroup:d,upperGroup:u}=oi(t.worldX,t.worldY,t.worldZ,t.rotationY),f=e*.5+o*.5;_t(s,d,o+.1,c,a+.1,i,-f,c*.5,0),_t(s,d,o+.1,c,a+.1,i,f,c*.5,0);const g=n-c;for(const M of[-f,f]){_t(s,u,o,g,a,i,M,c+g*.5,0);for(const v of[-.32,.32])for(const I of[-.35,.35])_t(s,u,.28,.3,.28,i,M+v,n+.15,I)}const _=.65,m=n-_*.5-.15;_t(s,u,e+.2,_,.72,i,0,m,0);const p=5;for(let M=0;M<p;M++){const v=-e*.38+e*.76*M/(p-1);_t(s,u,.06,1.35,.06,r,v,1.45,0,!0,!1)}_t(s,u,e*.86,.06,.08,r,0,1.05,0,!0,!1),_t(s,u,e*.86,.06,.08,r,0,1.65,0,!0,!1);const y=Ln(l*.5,(a+.1)*.5,0,n+.3,t.worldX,t.worldY,t.worldZ,t.rotationY);return{root:h,baseGroup:d,upperGroup:u,bounds:y,animated:[]}}function rx(s,t={}){const e=t.height??2.1,n=t.woodMat??le(s,{color:7227176}),i=t.roofMat??le(s,{color:10108462}),r=t.stoneMat??le(s,{color:7565415}),o=s.trackMaterial(new bt({color:16628340})),{root:a,baseGroup:l,upperGroup:c}=oi(t.worldX,t.worldY,t.worldZ,t.rotationY);_t(s,l,1.7,.35,1.7,r,0,.175,0);const h=s.trackGeometry(new Pe(.08,.45,5));for(const g of[-.75,-.25,.25,.75]){const _=new R(h,n);_.position.set(g,.225,.92),_.castShadow=!0,l.add(_)}for(const g of[-.62,.62])for(const _ of[-.62,.62])_t(s,c,.14,e+1.15,.14,n,g,(e+1.15)*.5,_);_t(s,c,1.55,.12,1.55,n,0,e,0),_t(s,c,1.5,.08,.08,n,0,e+.48,.7),_t(s,c,1.5,.08,.08,n,0,e+.48,-.7),_t(s,c,.08,.08,1.5,n,.7,e+.48,0),_t(s,c,.08,.08,1.5,n,-.7,e+.48,0);const d=new R(s.trackGeometry(new Pe(1.38,1.05,4)),i);d.position.set(0,e+1.65,0),d.rotation.y=Math.PI/4,d.castShadow=!0,d.receiveShadow=!0,c.add(d);const u=new R(s.trackGeometry(new gn(.12,0)),o);u.position.set(.75,e+.85,.75),s.markNoRaycast(u),c.add(u);const f=Ln(.95,.95,0,e+2.2,t.worldX,t.worldY,t.worldZ,t.rotationY);return{root:a,baseGroup:l,upperGroup:c,bounds:f,animated:[]}}function ox(s,t={}){const e=t.width??1.5,n=t.depth??1.8,i=t.height??1.25,r=t.clothMat??le(s,{color:9379106,roughness:.9}),o=t.woodMat??le(s,{color:6044706}),{root:a,baseGroup:l,upperGroup:c}=oi(t.worldX,t.worldY,t.worldZ,t.rotationY);_t(s,l,.45,.35,.45,o,e*.45,.175,n*.3);const h=s.trackGeometry(new Yt(e*.58,e*.58,n,3));h.rotateX(Math.PI/2);const d=new R(h,r);d.scale.set(1,i/(e*.86),1),d.position.set(0,i*.42,0),d.castShadow=!0,d.receiveShadow=!0,c.add(d),_t(s,c,.08,.08,n+.25,o,0,i*.96,0),_t(s,c,.08,i,.08,o,0,i*.5,n*.5+.05),_t(s,c,.08,i,.08,o,0,i*.5,-n*.5-.05);const u=Ln(e*.6,n*.55,0,i+.1,t.worldX,t.worldY,t.worldZ,t.rotationY);return{root:a,baseGroup:l,upperGroup:c,bounds:u,animated:[]}}function bi(s,t={}){const e=t.style??"gothic",n=t.width??2.2,i=t.height??2.5,r=t.stoneMat??le(s,{color:7108727}),o=t.mossMat??le(s,{color:4877103}),{root:a,baseGroup:l,upperGroup:c}=oi(t.worldX,t.worldY,t.worldZ,t.rotationY),h=.48,d=.52,u=n*.5-h*.5,f=.42;_t(s,l,h+.1,f,d+.1,r,-u,f*.5,0),_t(s,l,h+.1,f,d+.1,r,u,f*.5,0);const g=i*.68-f;if(_t(s,c,h,g,d,r,-u,f+g*.5,0),_t(s,c,h,g,d,r,u,f+g*.5,0),e==="gothic"){const p=n*.58,y=_t(s,c,p,.34,d*.9,r,-u*.48,i*.82,0);y.rotation.z=.58;const M=_t(s,c,p,.34,d*.9,r,u*.48,i*.82,0);M.rotation.z=-.58,_t(s,c,.36,.32,d*.92,r,0,i*.96,0)}else _t(s,c,n*.88,.34,d*.9,r,0,i*.82,0),_t(s,c,n*.5,.24,d*.85,r,0,i*.96,0);const _=_t(s,c,n*.46,.14,d*.95,o,-.2,i*.92,0,!1,!0);s.markNoRaycast(_);const m=Ln(n*.5+.08,d*.55,0,i+.15,t.worldX,t.worldY,t.worldZ,t.rotationY);return{root:a,baseGroup:l,upperGroup:c,bounds:m,animated:[]}}function ll(s,t={}){const e=t.height??1.3,n=t.radius??.34,i=t.stoneMat??le(s,{color:7764599}),r=t.mossMat??le(s,{color:4877103}),{root:o,baseGroup:a,upperGroup:l}=oi(t.worldX,t.worldY,t.worldZ,t.rotationY);_t(s,a,n*2.4,.22,n*2.4,i,0,.11,0),_t(s,a,n*2,.16,n*2,i,0,.3,0);const c=Math.max(.25,e-.38),h=new R(s.trackGeometry(new Yt(n*.88,n,c,7)),i);h.position.set(0,.38+c*.5,0),h.castShadow=!0,h.receiveShadow=!0,l.add(h);const d=_t(s,l,n*1.1,.2,n*.95,i,.04,e-.05,0);if(d.rotation.z=.24,t.moss){const f=_t(s,l,n*1.3,.1,n*1.3,r,0,e-.02,0,!1,!0);s.markNoRaycast(f)}const u=Ln(n*1.25,n*1.25,0,e+.08,t.worldX,t.worldY,t.worldZ,t.rotationY);return{root:o,baseGroup:a,upperGroup:l,bounds:u,animated:[]}}function Xi(s,t={}){const e=t.width??1.8,n=t.steps??4,i=t.height??.55,r=t.depth??1.2,o=t.stoneMat??le(s,{color:7565415}),a=new Tt;a.position.set(t.worldX??0,t.worldY??0,t.worldZ??0),a.rotation.y=t.rotationY??0;const l=i/n,c=r/n;for(let h=0;h<n;h++){const d=l*(h+1),u=-r*.5+c*(h+.5);_t(s,a,e,d,c+.02,o,0,d*.5,u)}return _t(s,a,.14,i*.72,r,o,-e*.5-.05,i*.36,0),_t(s,a,.14,i*.72,r,o,e*.5+.05,i*.36,0),a}function ax(s,t={}){const e=t.length??1,n=t.width??.96,i=t.woodMat??le(s,{color:6177068}),r=t.postMat??le(s,{color:4205340}),o=new Tt;o.position.set(t.worldX??0,t.worldY??0,t.worldZ??0),o.rotation.y=t.rotationY??0;const a=4,l=(e-.04)/a;for(let h=0;h<a;h++){const d=-e*.5+l*(h+.5)+.02;_t(s,o,n,.04,l-.03,i,0,-.023,d,!1,!0)}_t(s,o,.1,.14,e,r,-n*.36,-.11,0,!1,!0),_t(s,o,.1,.14,e,r,n*.36,-.11,0,!1,!0);const c=h=>{_t(s,o,.07,.28,.07,r,h,.11,-e*.42),_t(s,o,.07,.28,.07,r,h,.11,e*.42),_t(s,o,.05,.05,e,i,h,.22,0)};return t.railLeft&&c(-n*.46),t.railRight&&c(n*.46),o}function Ss(s,t={}){const e=t.pedestalHeight??.72,n=t.stoneMat??le(s,{color:7237997}),i=t.ironMat??le(s,{color:2830136,metalness:.55,roughness:.45}),r=s.trackMaterial(new bt({color:t.flameColor??16347926,transparent:!0,opacity:.88})),o=s.trackMaterial(new bt({color:t.coreColor??16707722})),{root:a,baseGroup:l,upperGroup:c}=oi(t.worldX,t.worldY,t.worldZ,0),h=e>.75?l:a,d=e>.75?c:a;if(_t(s,h,.52,Math.min(.42,e),.52,n,0,Math.min(.42,e)*.5,0),e>.42){const y=e-.42;_t(s,d,.38,y,.38,n,0,.42+y*.5,0)}const u=new R(s.trackGeometry(new Yt(.32,.18,.22,6)),i);u.position.set(0,e+.11,0),u.castShadow=!0,d.add(u);const f=new R(s.trackGeometry(new Pe(.2,.48,5)),r);f.position.set(0,e+.36,0),s.markNoRaycast(f),d.add(f);const g=new R(s.trackGeometry(new Pe(.11,.3,5)),o);g.position.set(0,e+.31,0),s.markNoRaycast(g),d.add(g);const _=t.phase??0,m={kind:"flame",update:(y,M)=>{const v=Math.sin(M*7.5+_)*.12+Math.cos(M*13+_)*.07;f.scale.set(1+v*.4,1+v,1-v*.3),f.rotation.y=M*1.4+_,g.scale.set(1-v*.3,1+v*.7,1+v*.3)}},p=Ln(.34,.34,0,e+.6,t.worldX,t.worldY,t.worldZ,0);return{root:a,baseGroup:l,upperGroup:c,bounds:p,animated:[m]}}function Wd(s,t={}){const e=t.variant??"pine",n=t.scale??1,{root:i,baseGroup:r,upperGroup:o}=oi(t.worldX,t.worldY,t.worldZ,t.rotationY);if(e==="gnarled"){const u=t.trunkMat??le(s,{color:4338988}),f=t.foliageMat??le(s,{color:3889452}),g=t.mossMat??le(s,{color:6057545}),_=new R(s.trackGeometry(new Yt(.28*n,.45*n,.45*n,7)),u);_.position.set(0,.22*n,0),_.castShadow=!0,r.add(_);for(let M=0;M<4;M++){const v=M*Math.PI/2+.3,I=_t(s,r,.16*n,.18*n,.65*n,u,Math.cos(v)*.36*n,.09*n,Math.sin(v)*.36*n);I.rotation.y=-v}const m=new R(s.trackGeometry(new Yt(.18*n,.28*n,1.8*n,7)),u);m.position.set(.06*n,1.3*n,0),m.rotation.z=-.12,m.castShadow=!0,o.add(m);const p=[[0,2.35*n,0,.85*n],[-.55*n,2.05*n,.25*n,.6*n],[.58*n,2.15*n,-.2*n,.58*n]];for(const[M,v,I,T]of p){const E=new R(s.trackGeometry(new Ll(T,0)),f);E.position.set(M,v,I),E.castShadow=!0,E.receiveShadow=!0,o.add(E)}for(const[M,v]of[[-.5*n,.25*n],[.5*n,-.15*n],[.1*n,.5*n]]){const I=_t(s,o,.08*n,.65*n,.08*n,g,M,1.55*n,v,!1,!1);s.markNoRaycast(I)}const y=Ln(.9*n,.9*n,0,3.1*n,t.worldX,t.worldY,t.worldZ,t.rotationY);return{root:i,baseGroup:r,upperGroup:o,bounds:y,animated:[]}}const a=t.trunkMat??le(s,{color:5189915}),l=t.foliageMat??le(s,{color:2507817}),c=new R(s.trackGeometry(new Yt(.14*n,.18*n,.45*n,6)),a);c.position.set(0,.225*n,0),c.castShadow=!0,r.add(c);const h=[[.82*n,1*n,.95*n],[.64*n,.9*n,1.55*n],[.44*n,.8*n,2.1*n]];for(const[u,f,g]of h){const _=new R(s.trackGeometry(new Pe(u,f,6)),l);_.position.set(0,g,0),_.castShadow=!0,_.receiveShadow=!0,o.add(_)}const d=Ln(.85*n,.85*n,0,2.55*n,t.worldX,t.worldY,t.worldZ,t.rotationY);return{root:i,baseGroup:r,upperGroup:o,bounds:d,animated:[]}}function lx(s,t={}){const e=ii(t.seed??606),n=t.spreadRadius??.36,i=le(s,{color:4156980,roughness:.7}),r=le(s,{color:16361684,roughness:.6}),o=le(s,{color:4020522}),a=le(s,{color:9190187}),l=new Tt;l.position.set(t.worldX??0,t.worldY??-.04,t.worldZ??0);const c=s.trackGeometry(new Yt(.14,.14,.015,7,1,!1,0,Math.PI*1.75)),h=t.lilyPads??3;for(let g=0;g<h;g++){const _=new R(c,i);_.position.set((e()-.5)*n*2,.005,(e()-.5)*n*2),_.rotation.y=e()*Math.PI*2,_.scale.setScalar(.7+e()*.55),l.add(_)}const d=s.trackGeometry(new gn(.06,0)),u=t.lotusCount??1;for(let g=0;g<u;g++){const _=new R(d,r);_.position.set((e()-.5)*n*1.6,.035,(e()-.5)*n*1.6),l.add(_)}const f=t.reedsCount??3;for(let g=0;g<f;g++){const _=(e()-.5)*n*1.8,m=(e()-.5)*n*1.8,p=.28+e()*.22,y=_t(s,l,.025,p,.025,o,_,p*.5,m,!1,!1);y.rotation.z=(e()-.5)*.18,_t(s,l,.04,.08,.04,a,_,p*.88,m,!1,!1)}return s.markNoRaycast(l),l}function Xd(s,t={}){const e=t.boardHalfExtent??6.2,n=t.depth??9.5,i=ii(t.seed??707),r=t.cliffMat??le(s,{color:4541012,roughness:.94}),o=new Tt;_t(s,o,e*2,n,e*2,r,0,-.16-n*.5,0,!1,!0);const a=6,l=e*2/a;for(let c=0;c<4;c++)for(let h=0;h<a;h++){const d=-e+l*(h+.5),u=l*(.9+i()*.25),f=n*(.72+i()*.28),g=.65+i()*.65,_=-.16-f*.5,m=e+g*.35,p=c===0||c===1?d:c===2?-m:m,y=c===0?-m:c===1?m:d,M=c<2?u:g,v=c<2?g:u;_t(s,o,M,f,v,r,p,_,y,!1,!0)}return s.markNoRaycast(o),o}function Yd(s,t={}){const e=t.radius??38,n=t.variant??"fortress",i=new Tt,r=ix(s,t.skyPalette),o=s.trackMaterial(new bt({map:r,side:ze,fog:!1})),a=new R(s.trackGeometry(new Yt(e,e,28,32,1,!0)),o);a.position.y=2.5,i.add(a);const l=s.trackMaterial(new bt({color:t.silhouetteColor??(n==="fortress"?1779e3:990498)})),c=12;for(let h=0;h<c;h++){const d=h*Math.PI*2/c,u=24+h%3*3,f=4+h%4*1.6,g=new R(s.trackGeometry(new Pe(4.5,f,5)),l);g.position.set(Math.cos(d)*u,-3.5+f*.5,Math.sin(d)*u),i.add(g)}if(n==="fortress")_t(s,i,4.2,4.8,3,l,-18,-1,-22,!1,!1),_t(s,i,1.4,6.8,1.4,l,-20.2,0,-22,!1,!1),_t(s,i,1.4,6.2,1.4,l,-15.8,-.3,-22,!1,!1);else{for(let h=0;h<4;h++)_t(s,i,.8,3.2,.8,l,-15+h*2.6,-1.6,-20,!1,!1);_t(s,i,9.2,.7,.9,l,-11.1,.2,-20,!1,!1)}return s.markNoRaycast(i),i}function cx(s,t={}){const e=t.width??1.5,n=t.height??8,i=kl(s,{seed:808,baseColor:"#2d6e7e",rippleColor:"#93e5f5",deepColor:"#1b4a58"});i.repeat.set(1,3);const r=s.trackMaterial(new bt({map:i,color:t.waterColor??8246268,transparent:!0,opacity:.72})),o=Vd(s,"rgba(210, 238, 250, 0.55)"),a=s.trackMaterial(new bt({map:o,transparent:!0,depthWrite:!1})),l=new Tt;l.position.set(t.worldX??0,t.worldY??-.2,t.worldZ??0),l.rotation.y=t.rotationY??0;const c=new R(s.trackGeometry(new Xe(e,n)),r);c.position.set(0,-n*.5,0),l.add(c);const h=new R(s.trackGeometry(new Xe(e*2.2,e*1.4)),a);return h.rotation.x=-Math.PI/2,h.position.set(0,-n+.35,.4),l.add(h),s.markNoRaycast(l),{root:l,animated:[{kind:"waterfall",update:(u,f)=>{i.offset.y-=u*1.35,h.scale.setScalar(1+Math.sin(f*2.2)*.08)}}]}}function uo(s,t={}){const e=t.woodMat??le(s,{color:5189915}),n=tx(s,{emblem:t.emblem,clothColor:t.clothColor,trimColor:t.trimColor,emblemColor:t.emblemColor}),i=s.trackMaterial(new et({map:n,transparent:!0,alphaTest:.1,side:oe,roughness:.85})),{root:r,baseGroup:o,upperGroup:a}=oi(t.worldX,t.worldY,t.worldZ,t.rotationY);_t(s,o,.24,.36,.24,e,0,.18,0),_t(s,a,.07,1.9,.07,e,0,1.25,0),_t(s,a,.65,.06,.06,e,0,2.12,0);const l=new R(s.trackGeometry(new Xe(.56,1.12)),i);l.position.set(0,1.52,.04),l.castShadow=!0,a.add(l);const c=Ln(.34,.16,0,2.25,t.worldX,t.worldY,t.worldZ,t.rotationY);return{root:r,baseGroup:o,upperGroup:a,bounds:c,animated:[]}}const fo=1,Ah=.16;function qd(s,t,e=0){const n=(t-1)/2;return new L((s.x-n)*fo,e,(n-s.y)*fo)}function hx(s){const t=Ms(s,{seed:101,variant:"floor",baseColor:"#8b887e",secondaryColor:"#767268",mortarColor:"#4a473f",mossColor:"#4e6936",mossAmount:.22}),e=Ms(s,{seed:207,variant:"floor",baseColor:"#837f75",secondaryColor:"#6d695f",mortarColor:"#44413a",mossColor:"#3f5a2c",mossAmount:.34}),n=Ms(s,{seed:313,variant:"masonry",baseColor:"#878379",secondaryColor:"#6f6b62",mortarColor:"#47453e",mossColor:"#4a6633",mossAmount:.26}),i=Gd(s,{seed:419,baseColor:"#4e6936",highlightColor:"#6b8c47",earthColor:"#38522b"}),r=zd(s,{seed:521,baseColor:"#6e4728",grainColor:"#4a2e18",planks:5}),o=ex(s,{seed:631,baseColor:"#9a3e2e",darkColor:"#7c2d22"}),a=l=>s.trackMaterial(new et({roughness:.88,metalness:.05,...l}));return{floorMats:[a({map:t,color:16052198,roughness:.88}),a({map:e,color:15130579,roughness:.91}),a({map:t,color:14209735,roughness:.92})],stoneLightMat:a({map:n,color:15262423,roughness:.86}),stoneDarkMat:a({map:n,color:12367530,roughness:.9}),mossMat:a({map:i,color:14411471,roughness:.95}),woodMat:a({map:r,color:15061950,roughness:.82}),woodDarkMat:a({map:r,color:10914157,roughness:.86}),ironMat:a({color:2830136,metalness:.62,roughness:.44}),terracottaMat:a({map:o,color:15916758,roughness:.78}),crimsonMat:a({color:9379106,roughness:.9}),cliffMat:a({color:4935769,roughness:.95,metalness:.04}),flowerRedMat:a({color:13126449,roughness:.8}),flowerWhiteMat:a({color:14870768,roughness:.8})}}function dx(s,t,e,n,i){const r=qd(t.pos,e,0),o=new Tt;o.position.set(r.x,0,r.z);const a=(c,h,d,u,f,g,_,m=0)=>{const p=new R(s.trackGeometry(new Q(c,h,d)),u);return p.position.set(f,g,_),p.rotation.y=m,p.castShadow=!0,p.receiveShadow=!0,o.add(p),p},l=(c,h,d,u,f,g)=>{const _=new R(s.trackGeometry(new Q(c,h,d)),n.mossMat);_.position.set(u,f,g),_.receiveShadow=!0,s.markNoRaycast(_),o.add(_)};switch(t.kind){case"wall":{a(.88,.24,.82,n.stoneDarkMat,0,.12,0),a(.84,.72,.72,n.stoneLightMat,0,.6,0);const c=.28+i()*.12,h=.18+i()*.12;a(.34,c,.64,n.stoneLightMat,-.22,.96+c*.5,0),a(.28,h,.58,n.stoneDarkMat,.24,.96+h*.5,.02),l(.32,.06,.42,-.18,.98+c,.05);break}case"pillar":{a(.84,.2,.84,n.stoneDarkMat,0,.1,0),a(.68,.16,.68,n.stoneLightMat,0,.28,0);const c=new R(s.trackGeometry(new Yt(.28,.33,.78,8)),n.stoneLightMat);c.position.set(0,.75,0),c.castShadow=!0,c.receiveShadow=!0,o.add(c),a(.56,.18,.54,n.stoneDarkMat,.02,1.23,-.02,.18),l(.36,.07,.34,.05,1.35,0);break}case"crate":{a(.56,.52,.56,n.woodMat,-.08,.26,.06,.12),a(.58,.07,.58,n.woodDarkMat,-.08,.48,.06,.12),a(.58,.07,.58,n.woodDarkMat,-.08,.08,.06,.12),a(.34,.34,.34,n.woodDarkMat,.24,.17,-.2,-.22);break}case"barrel":{const c=(h,d,u,f)=>{const g=new R(s.trackGeometry(new Yt(f*.88,f*.84,u,10)),n.woodMat);g.position.set(h,u*.5,d),g.castShadow=!0,g.receiveShadow=!0,o.add(g);for(const _ of[u*.24,u*.76]){const m=new R(s.trackGeometry(new Yt(f*.92,f*.92,.05,10)),n.ironMat);m.position.set(h,_,d),o.add(m)}};c(-.14,.08,.6,.22),c(.2,-.14,.48,.18);break}}return o}function us(s,t,e,n,i,r,o=0){const a=new Tt;a.position.set(n,i,r),a.rotation.y=o;const l=new R(s.trackGeometry(new Q(.52,.48,.52)),e.woodMat);l.position.set(-.24,.24,.05),l.castShadow=!0,l.receiveShadow=!0,a.add(l);const c=new R(s.trackGeometry(new Yt(.2,.18,.54,10)),e.woodDarkMat);c.position.set(.24,.27,-.08),c.castShadow=!0,c.receiveShadow=!0,a.add(c);const h=new R(s.trackGeometry(new Yt(.21,.21,.05,10)),e.ironMat);h.position.set(.24,.4,-.08),a.add(h),s.markNoRaycast(a),t.add(a)}function $r(s,t,e,n,i,r,o=!0){const a=new Tt;a.position.set(n,i,r);const l=new R(s.trackGeometry(new Q(.75,.08,.62)),e.mossMat);if(l.position.y=.04,l.receiveShadow=!0,a.add(l),o){const c=[[-.18,.12,!0],[.14,-.1,!1],[.04,.18,!0]];for(const[h,d,u]of c){const f=new R(s.trackGeometry(new Wi(.065,0)),u?e.flowerRedMat:e.flowerWhiteMat);f.position.set(h,.13,d),a.add(f)}}s.markNoRaycast(a),t.add(a)}function fs(s,t,e,n,i,r,o,a,l){const c=new R(s.trackGeometry(new Q(n,i,r)),e);c.position.set(o,a,l),c.receiveShadow=!0,c.castShadow=!0,s.markNoRaycast(c),t.add(c)}function ux(s,t){const e=new Tt,n=s.trackMaterial(new bt({color:4155008,transparent:!0,opacity:.7})),i=s.trackMaterial(new bt({color:2371396})),r=[[-12,-8.8,-14,7.5,.45],[-15,-8.8,-19,8.2,-.35],[-19,-8.8,-24,9,.25]];for(const[a,l,c,h,d]of r){const u=new R(s.trackGeometry(new Xe(2.2,h)),n);u.rotation.x=-Math.PI/2,u.rotation.z=d,u.position.set(a,l,c),e.add(u)}const o=new R(s.trackGeometry(new Q(5.5,.55,.9)),i);o.position.set(-14.5,-5.2,-21.5),e.add(o);for(const a of[-16.6,-12.4]){const l=new R(s.trackGeometry(new Q(.9,4.2,.95)),i);l.position.set(a,-7.2,-21.5),e.add(l)}s.markNoRaycast(e),t.add(e)}function fx(s){const t=new Hd,e=ii(s.seed??404),n=hx(t),i=new Tt;i.name="fortress-scenario";const r=[],o=[],a=[],l=[],c=(H,z,V=!0)=>{t.markNoRaycast(z.root),i.add(z.root),l.push(...z.animated),V&&a.push({id:H,bounds:z.bounds,upperGroup:z.upperGroup})},h=t.trackGeometry(new Q(fo*.985,Ah,fo*.985));for(let H=0;H<s.gridSize;H++)for(let z=0;z<s.gridSize;z++){const V=qd({x:H,y:z},s.gridSize,-Ah*.5),J=Math.floor(e()*n.floorMats.length),W=new R(h,n.floorMats[J]);W.position.copy(V),W.receiveShadow=!0;const rt={kind:"tile",gridCoord:{x:H,y:z}};W.userData=rt,i.add(W),r.push(W)}for(const H of s.obstacleDefs){const z=dx(t,H,s.gridSize,n,e);t.applyObstacleMetadata(z,H.kind,H.pos,o),i.add(z)}fs(t,i,n.stoneDarkMat,14.2,.34,1.1,0,-.17,-6.65),fs(t,i,n.stoneDarkMat,14.2,.34,1,0,-.17,6.6),fs(t,i,n.stoneDarkMat,1.6,.34,13.6,-6.9,-.17,0),fs(t,i,n.stoneDarkMat,1.2,.34,13.6,6.65,-.17,0),fs(t,i,n.stoneLightMat,2.5,.14,4.5,0,-.07,-9.6),i.add(Xd(t,{boardHalfExtent:6.85,depth:10.5,seed:707,cliffMat:n.cliffMat}));const d=Xi(t,{width:1.9,steps:4,height:.42,depth:1.1,stoneMat:n.stoneLightMat,worldX:-3.2,worldY:-.25,worldZ:-6.75,rotationY:0});t.markNoRaycast(d),i.add(d);const u=Xi(t,{width:1.7,steps:4,height:.46,depth:1.15,stoneMat:n.stoneLightMat,worldX:-6.75,worldY:-.35,worldZ:2.3,rotationY:Math.PI/2});t.markNoRaycast(u),i.add(u);const f=Xi(t,{width:2,steps:4,height:.5,depth:1.25,stoneMat:n.stoneLightMat,worldX:-2.6,worldY:-.45,worldZ:6.85,rotationY:Math.PI});t.markNoRaycast(f),i.add(f);const g=Xi(t,{width:1.8,steps:4,height:.44,depth:1.15,stoneMat:n.stoneLightMat,worldX:6.75,worldY:-.32,worldZ:-2.2,rotationY:-Math.PI/2});t.markNoRaycast(g),i.add(g),c("north-gatehouse",sx(t,{openingWidth:2.2,height:2.95,stoneMat:n.stoneLightMat,ironMat:n.ironMat,worldX:0,worldY:0,worldZ:-7.15,rotationY:0})),c("north-wall-west-inner",qn(t,{length:3.1,height:2.15,thickness:.62,crenellations:!0,moss:!0,stoneMat:n.stoneLightMat,mossMat:n.mossMat,worldX:-3.65,worldY:0,worldZ:-7.05})),c("north-wall-west-outer",qn(t,{length:2.4,height:1.85,thickness:.58,crenellations:!0,moss:!0,stoneMat:n.stoneDarkMat,mossMat:n.mossMat,worldX:-6.35,worldY:0,worldZ:-6.95})),c("north-wall-east-inner",qn(t,{length:3.1,height:2.15,thickness:.62,crenellations:!0,moss:!0,stoneMat:n.stoneLightMat,mossMat:n.mossMat,worldX:3.65,worldY:0,worldZ:-7.05})),c("north-wall-east-outer",qn(t,{length:2.2,height:1.7,thickness:.56,crenellations:!0,moss:!1,stoneMat:n.stoneDarkMat,worldX:6.1,worldY:0,worldZ:-6.85}));const _=[-1.7,-6.55],m=[1.7,-6.55];c("gate-brazier-left",Ss(t,{pedestalHeight:.82,stoneMat:n.stoneDarkMat,ironMat:n.ironMat,phase:.4,worldX:_[0],worldY:0,worldZ:_[1]})),c("gate-brazier-right",Ss(t,{pedestalHeight:.82,stoneMat:n.stoneDarkMat,ironMat:n.ironMat,phase:2.1,worldX:m[0],worldY:0,worldZ:m[1]}));for(const[H,z]of[["gate-banner-left",-2.75],["gate-banner-right",2.75]])c(H,uo(t,{emblem:"sword",clothColor:"#8f1d22",trimColor:"#d4a24c",emblemColor:"#e6c173",woodMat:n.woodDarkMat,worldX:z,worldY:.25,worldZ:-6.65,rotationY:0}));us(t,i,n,-4.6,0,-6.45,.25),us(t,i,n,4.9,0,-6.45,-.3);const p=[-7.35,-.7],y=rx(t,{height:2.25,woodMat:n.woodMat,roofMat:n.terracottaMat,stoneMat:n.stoneDarkMat,worldX:p[0],worldY:0,worldZ:p[1],rotationY:Math.PI/2});c("west-watchtower",y),c("watchtower-banner",uo(t,{emblem:"sword",clothColor:"#8f1d22",trimColor:"#d4a24c",emblemColor:"#e6c173",woodMat:n.woodDarkMat,worldX:-6.5,worldY:.3,worldZ:-.7,rotationY:Math.PI/2})),c("west-crimson-tent",ox(t,{width:1.65,depth:2,height:1.32,clothMat:n.crimsonMat,woodMat:n.woodDarkMat,worldX:-7.25,worldY:0,worldZ:-3.7,rotationY:Math.PI/2})),us(t,i,n,-6.7,0,.75,.6),us(t,i,n,-6.7,0,-5.2,-.4),c("west-south-wall",qn(t,{length:2.2,height:1.15,thickness:.5,crenellations:!1,moss:!0,stoneMat:n.stoneDarkMat,mossMat:n.mossMat,worldX:-6.65,worldY:0,worldZ:4.4,rotationY:Math.PI/2})),c("south-roman-arch",bi(t,{style:"roman",width:2.25,height:2.35,stoneMat:n.stoneLightMat,mossMat:n.mossMat,worldX:2.2,worldY:0,worldZ:6.75,rotationY:0})),c("south-parapet-west",qn(t,{length:2.4,height:.95,thickness:.46,crenellations:!1,moss:!0,stoneMat:n.stoneDarkMat,mossMat:n.mossMat,worldX:-5.1,worldY:0,worldZ:6.65,rotationY:0})),c("east-parapet-north",qn(t,{length:2.3,height:1.1,thickness:.48,crenellations:!0,moss:!0,stoneMat:n.stoneDarkMat,mossMat:n.mossMat,worldX:6.65,worldY:0,worldZ:-4.6,rotationY:Math.PI/2}));const M=[6.55,1.55];c("courtyard-brazier",Ss(t,{pedestalHeight:.78,stoneMat:n.stoneDarkMat,ironMat:n.ironMat,phase:3.7,worldX:M[0],worldY:0,worldZ:M[1]})),us(t,i,n,6.45,0,-.4,-.8),us(t,i,n,-4.6,0,6.4,.4),$r(t,i,n,-6.55,0,1.6,!0),$r(t,i,n,4.4,0,6.55,!0),$r(t,i,n,6.45,0,3.2,!1),$r(t,i,n,-.5,0,6.55,!0);const v=kl(t,{seed:502});v.repeat.set(18,18);const I=t.trackGeometry(new Xe(88,88)),T=t.trackMaterial(new et({map:v,color:2450298,roughness:.24,metalness:.22,transparent:!0,opacity:.94})),E=new R(I,T);E.rotation.x=-Math.PI/2,E.position.y=-1.55,E.receiveShadow=!0,t.markNoRaycast(E),i.add(E),l.push({kind:"water",update:H=>{v.offset.x=(v.offset.x+H*.018)%1,v.offset.y=(v.offset.y+H*.011)%1}}),fs(t,i,n.stoneDarkMat,1.1,.16,1.8,6.75,-.06,4.75);const C=cx(t,{width:1.65,height:1.55,waterColor:8246268,worldX:7.38,worldY:-.15,worldZ:4.75,rotationY:Math.PI/2});i.add(C.root),l.push(...C.animated);const S=[["pine-nw-1",-7.45,-.08,-7.25,1.05,!0],["pine-ne-1",7.35,-.08,-7.55,1.08,!0]];for(const[H,z,V,J,W,rt]of S)c(H,Wd(t,{variant:"pine",scale:W,worldX:z,worldY:V,worldZ:J}),rt);i.add(Yd(t,{variant:"fortress",silhouetteColor:1779e3,skyPalette:{topColor:"#17233d",midColor:"#314568",horizonColor:"#c7895c",groundColor:"#1a2230"}})),ux(t,i);const x=[p[0]+.75,2.25+.85,p[1]-.75],P={backgroundColor:2372173,fogColor:2766416,fogDensity:.0085,ambientColor:9741240,ambientIntensity:.45,hemiSkyColor:9356776,hemiGroundColor:2897213,hemiIntensity:.68,dirLightColor:16770751,dirLightIntensity:1.55,dirLightPosition:[10,16,8],rimLightColor:8246268,rimLightIntensity:.5,pointLights:[{position:[_[0],1.45,_[1]],color:16486972,intensity:2.1,distance:9.5,decay:1.8,flicker:!0},{position:[m[0],1.45,m[1]],color:16486972,intensity:2.1,distance:9.5,decay:1.8,flicker:!0},{position:x,color:16628340,intensity:1.85,distance:8.5,decay:1.8,flicker:!0},{position:[M[0],1.4,M[1]],color:16486972,intensity:1.9,distance:9,decay:1.8,flicker:!0}]};return{group:i,tileMeshes:r,obstacleMeshes:o,occluders:a,animatedObjects:l,atmosphere:P,update:(H,z)=>{for(const V of l)V.update(H,z)},dispose:()=>{t.dispose()}}}const Th=1,Ch=.16;function Zs(s){return`${s.x},${s.y}`}function Kr(s,t,e=0){const n=(t-1)/2;return new L((s.x-n)*Th,e,(n-s.y)*Th)}function px(s,t){const e=Ms(s,{seed:t+11,variant:"floor",baseColor:"#6c7877",secondaryColor:"#586565",mortarColor:"#36413e",mossAmount:.24}),n=Ms(s,{seed:t+23,variant:"floor",baseColor:"#525e5f",secondaryColor:"#445051",mortarColor:"#2d3735",mossAmount:.3}),i=Ms(s,{seed:t+37,variant:"masonry",baseColor:"#667271",secondaryColor:"#4f5a5b",mortarColor:"#323c3a",mossAmount:.28}),r=Gd(s,{seed:t+51,baseColor:"#4a6b2f",highlightColor:"#638740",earthColor:"#355022"}),o=zd(s,{seed:t+67,baseColor:"#5e412c",grainColor:"#402b1c"}),a=kl(s,{seed:t+83,deepColor:"#132d2d",baseColor:"#1e4442",rippleColor:"#4a7a75"});a.repeat.set(7,7);const l=nx(s,{stoneColor:"#64706f",engravingColor:"#33403f",runeColor:"#768d85"}),c=Vd(s);return{stoneFloorLight:s.trackMaterial(new et({map:e,roughness:.86,metalness:.05})),stoneFloorDark:s.trackMaterial(new et({map:n,roughness:.88,metalness:.05})),masonry:s.trackMaterial(new et({map:i,roughness:.9,metalness:.04})),darkStone:s.trackMaterial(new et({color:3884101,roughness:.93,metalness:.04})),moss:s.trackMaterial(new et({map:r,roughness:.94,metalness:.02})),wood:s.trackMaterial(new et({map:o,roughness:.85,metalness:.05})),darkWood:s.trackMaterial(new et({color:4205340,roughness:.9,metalness:.05})),iron:s.trackMaterial(new et({color:2830136,roughness:.45,metalness:.58})),water:s.trackMaterial(new et({map:a,color:1784634,roughness:.14,metalness:.18,transparent:!0,opacity:.84})),waterTex:a,waterBed:s.trackMaterial(new et({color:992292,roughness:.95,metalness:.02})),medallion:s.trackMaterial(new et({map:l,roughness:.82,metalness:.06})),mistTex:c,bridgeClickMat:s.trackMaterial(new bt({transparent:!0,opacity:0,depthWrite:!1}))}}function He(s,t,e,n){s.push({id:t,bounds:e.bounds,upperGroup:e.upperGroup});for(const i of e.animated)n.push(i)}function an(s,t,e,n,i,r,o,a,l,c=!0,h=!0){const d=new R(s.trackGeometry(new Q(e,n,i)),r);return d.position.set(o,a,l),d.castShadow=c,d.receiveShadow=h,t.add(d),d}function mx(s,t,e,n){const i=new Tt;return i.position.copy(e),i.rotation.y=n,an(s,i,.66,.62,.66,t.wood,0,.31,0),an(s,i,.7,.08,.7,t.darkWood,0,.06,0),an(s,i,.7,.08,.7,t.darkWood,0,.56,0),an(s,i,.68,.07,.08,t.iron,0,.31,.31),an(s,i,.68,.07,.08,t.iron,0,.31,-.31),i}function gx(s,t,e){const n=new Tt;n.position.copy(e);const i=new R(s.trackGeometry(new Yt(.28,.25,.7,10)),t.wood);i.position.y=.35,i.castShadow=!0,i.receiveShadow=!0,n.add(i);const r=s.trackGeometry(new Yt(.295,.295,.06,10));for(const o of[.16,.54]){const a=new R(r,t.iron);a.position.y=o,a.castShadow=!0,n.add(a)}return n}function _x(s,t,e,n,i,r,o,a){const{gridSize:l,obstacleDefs:c,bridgeCells:h=[]}=e,d=new Set(c.filter(_=>_.kind==="water").map(_=>Zs(_.pos))),u=new Set(h.map(_=>Zs(_))),f=s.trackGeometry(new Q(.96,Ch,.96)),g=s.trackGeometry(new Xe(.96,.96));for(let _=0;_<l;_++)for(let m=0;m<l;m++){const p={x:m,y:_},y=Zs(p);if(d.has(y)){const I=Kr(p,l,-.04),T=lx(s,{seed:Math.floor(a()*1e5)+m*31+_*97,lilyPads:a()>.35?2:1,lotusCount:a()>.55?1:0,reedsCount:a()>.3?3:2,spreadRadius:.34,worldX:I.x,worldY:I.y,worldZ:I.z});t.add(T);continue}if(u.has(y)){const I=Kr(p,l,0),T=d.has(Zs({x:m-1,y:_})),E=d.has(Zs({x:m+1,y:_})),C=ax(s,{length:1,width:.96,railLeft:T,railRight:E,woodMat:n.wood,postMat:n.darkWood,worldX:I.x,worldY:0,worldZ:I.z});s.markNoRaycast(C),t.add(C);const S=new R(g,n.bridgeClickMat);S.rotation.x=-Math.PI/2,S.position.set(I.x,-.001,I.z),S.userData={kind:"tile",gridCoord:{x:m,y:_}},t.add(S),i.push(S);continue}const M=(m+_)%2===0,v=new R(f,M?n.stoneFloorLight:n.stoneFloorDark);v.position.copy(Kr(p,l,-Ch/2)),v.receiveShadow=!0,v.userData={kind:"tile",gridCoord:{x:m,y:_}},t.add(v),i.push(v)}for(const _ of c){if(_.kind==="water")continue;const m=Kr(_.pos,l,0);if(_.kind==="pillar"){const p=ll(s,{height:1.35+a()*.25,radius:.34,moss:!0,stoneMat:n.masonry,mossMat:n.moss,worldX:m.x,worldY:0,worldZ:m.z,rotationY:Math.floor(a()*4)*(Math.PI/2)});s.applyObstacleMetadata(p.root,"pillar",_.pos,r),t.add(p.root),o.push({id:`obs-pillar-${_.pos.x}-${_.pos.y}`,bounds:p.bounds,upperGroup:p.upperGroup})}else if(_.kind==="wall"){const p=qn(s,{length:.94,height:1.4,thickness:.56,crenellations:!1,moss:!0,stoneMat:n.masonry,mossMat:n.moss,worldX:m.x,worldY:0,worldZ:m.z});s.applyObstacleMetadata(p.root,"wall",_.pos,r),t.add(p.root),o.push({id:`obs-wall-${_.pos.x}-${_.pos.y}`,bounds:p.bounds,upperGroup:p.upperGroup})}else if(_.kind==="crate"){const p=mx(s,n,m,(a()-.5)*.24);s.applyObstacleMetadata(p,"crate",_.pos,r),t.add(p)}else if(_.kind==="barrel"){const p=gx(s,n,m);s.applyObstacleMetadata(p,"barrel",_.pos,r),t.add(p)}}}function vx(s,t,e,n,i,r){const a=an(s,t,7.4,.72,4,e.masonry,2.2,.16000000000000003,-8.45,!0,!0);s.markNoRaycast(a);const l=an(s,t,7.5,.06,4.1,e.moss,2.2,.52-.01,-8.45,!1,!0);s.markNoRaycast(l);const c=new R(s.trackGeometry(new Yt(1.15,1.15,.03,24)),e.medallion);c.position.set(2.2,.52+.015,-7.85),c.receiveShadow=!0,s.markNoRaycast(c),t.add(c);const h=Xi(s,{width:3.1,steps:4,height:.52,depth:1.35,stoneMat:e.masonry,worldX:2.2,worldY:0,worldZ:-6.55,rotationY:0});s.markNoRaycast(h),t.add(h);const d=bi(s,{style:"gothic",width:3.3,height:3.5,stoneMat:e.masonry,mossMat:e.moss,worldX:2.2,worldY:.52,worldZ:-9.55});s.markNoRaycast(d.root),t.add(d.root),He(n,"ne-main-gothic-arch",d,i);const u=bi(s,{style:"gothic",width:1.9,height:2.45,stoneMat:e.masonry,mossMat:e.moss,worldX:-.55,worldY:.52,worldZ:-9.15,rotationY:.12});s.markNoRaycast(u.root),t.add(u.root),He(n,"ne-left-side-arch",u,i);const f=bi(s,{style:"gothic",width:1.9,height:2.35,stoneMat:e.masonry,mossMat:e.moss,worldX:4.95,worldY:.52,worldZ:-9.15,rotationY:-.14});s.markNoRaycast(f.root),t.add(f.root),He(n,"ne-right-side-arch",f,i);const g=uo(s,{emblem:"tree",clothColor:"#7f1d24",trimColor:"#d4a24c",emblemColor:"#e7dfd1",woodMat:e.darkWood,worldX:.45,worldY:.52,worldZ:-9.15});s.markNoRaycast(g.root),t.add(g.root),He(n,"ne-banner-left",g,i);const _=uo(s,{emblem:"tree",clothColor:"#7f1d24",trimColor:"#d4a24c",emblemColor:"#e7dfd1",woodMat:e.darkWood,worldX:3.95,worldY:.52,worldZ:-9.15});s.markNoRaycast(_.root),t.add(_.root),He(n,"ne-banner-right",_,i);const m=[[.15,.52,-7.05,.4,"ne-brazier-west"],[4.25,.52,-7.05,1.9,"ne-brazier-east"]];for(const[E,C,S,x,P]of m){const F=Ss(s,{pedestalHeight:.68,stoneMat:e.masonry,ironMat:e.iron,flameColor:16347926,coreColor:16707722,phase:x,worldX:E,worldY:C,worldZ:S});s.markNoRaycast(F.root),t.add(F.root),He(n,P,F,i),r.push({position:[E,C+1.08,S],color:16347926,intensity:2.6,distance:10.5,decay:1.8,flicker:!0})}const p=an(s,t,5.2,.72,4.6,e.masonry,-6.4,.52-.36,-8.4,!0,!0);s.markNoRaycast(p);const y=an(s,t,5.3,.06,4.7,e.moss,-6.4,.52-.01,-8.4,!1,!0);s.markNoRaycast(y);const M=Xi(s,{width:1.8,steps:4,height:.52,depth:1.25,stoneMat:e.masonry,worldX:-4.8,worldY:0,worldZ:-6.55,rotationY:0});s.markNoRaycast(M),t.add(M);const v=Wd(s,{variant:"gnarled",scale:1.75,worldX:-7.5,worldY:.52,worldZ:-8.6,rotationY:.45});s.markNoRaycast(v.root),t.add(v.root),He(n,"nw-ancient-tree",v,i);const I=bi(s,{style:"gothic",width:2.1,height:2.5,stoneMat:e.masonry,mossMat:e.moss,worldX:-3.2,worldY:.52,worldZ:-9.3,rotationY:.25});s.markNoRaycast(I.root),t.add(I.root),He(n,"nw-ruined-arch",I,i);const T=Ss(s,{pedestalHeight:.65,stoneMat:e.masonry,ironMat:e.iron,flameColor:16347926,coreColor:16707722,phase:3.1,worldX:-5.85,worldY:.52,worldZ:-6.95});s.markNoRaycast(T.root),t.add(T.root),He(n,"nw-brazier",T,i),r.push({position:[-5.85,.52+1.05,-6.95],color:16347926,intensity:2.5,distance:10,decay:1.8,flicker:!0})}function xx(s,t,e,n,i,r,o){const a=an(s,t,4.6,.34,3.8,e.masonry,-6.8,.01,6.9,!0,!0);s.markNoRaycast(a);const l=bi(s,{style:"gothic",width:2.25,height:2.6,stoneMat:e.masonry,mossMat:e.moss,worldX:-7.5,worldY:.18,worldZ:6.4,rotationY:Math.PI*.38});s.markNoRaycast(l.root),t.add(l.root),He(n,"sw-ruined-arch",l,i);const c=Ss(s,{pedestalHeight:.65,stoneMat:e.masonry,ironMat:e.iron,flameColor:16347926,coreColor:16707722,phase:4.7,worldX:-6.35,worldY:.18,worldZ:7.55});s.markNoRaycast(c.root),t.add(c.root),He(n,"sw-brazier",c,i),r.push({position:[-6.35,.18+1.05,7.55],color:16347926,intensity:2.5,distance:10,decay:1.8,flicker:!0});const h=an(s,t,4.8,.32,3.8,e.masonry,6.7,0,6.8,!0,!0);s.markNoRaycast(h);const d=Xi(s,{width:2,steps:3,height:.28,depth:1,stoneMat:e.masonry,worldX:5.2,worldY:-.1,worldZ:6.95,rotationY:-Math.PI*.5});s.markNoRaycast(d),t.add(d);const u=ll(s,{height:1.9,radius:.36,moss:!0,stoneMat:e.masonry,mossMat:e.moss,worldX:7.1,worldY:.16,worldZ:5.5,rotationY:.4});s.markNoRaycast(u.root),t.add(u.root),He(n,"se-pillar-1",u,i);const f=ll(s,{height:1.45,radius:.32,moss:!0,stoneMat:e.masonry,mossMat:e.moss,worldX:7.9,worldY:.16,worldZ:7.4,rotationY:1.2});s.markNoRaycast(f.root),t.add(f.root),He(n,"se-pillar-2",f,i);const g=qn(s,{length:3.4,height:.95,thickness:.52,crenellations:!1,moss:!0,stoneMat:e.masonry,mossMat:e.moss,worldX:-1.6,worldY:-.05,worldZ:6.75});s.markNoRaycast(g.root),t.add(g.root),He(n,"south-low-wall",g,i);const _=[[-6.65,-3.6,1.1,4.4],[-6.65,3.6,1.1,4.4],[6.65,-3.6,1.1,4.4],[6.65,3.6,1.1,4.4]];for(const[p,y,M,v]of _){const I=an(s,t,M,.28,v,e.masonry,p,-.08,y,!0,!0);s.markNoRaycast(I)}const m=bi(s,{style:"gothic",width:2,height:2.2,stoneMat:e.masonry,mossMat:e.moss,worldX:-6.7,worldY:.06,worldZ:-3.2,rotationY:Math.PI*.5});s.markNoRaycast(m.root),t.add(m.root),He(n,"west-mid-arch",m,i)}function yx(s,t,e,n,i){const r=Xd(s,{boardHalfExtent:6.2,depth:9.5,seed:909,cliffMat:e.darkStone});t.add(r);const o=new R(s.trackGeometry(new Xe(54,54)),e.waterBed);o.rotation.x=-Math.PI/2,o.position.y=-.15,o.receiveShadow=!0,s.markNoRaycast(o),t.add(o);const a=new R(s.trackGeometry(new Xe(52,52)),e.water);a.rotation.x=-Math.PI/2,a.position.y=-.045,a.receiveShadow=!0,s.markNoRaycast(a),t.add(a),n.push({kind:"water",update:d=>{e.waterTex.offset.x=(e.waterTex.offset.x+d*.025)%1,e.waterTex.offset.y=(e.waterTex.offset.y+d*.015)%1}});for(let d=0;d<4;d++){const u=bi(s,{style:"roman",width:2.3,height:2.9,stoneMat:e.darkStone,mossMat:e.moss,worldX:-5.5+d*2.25,worldY:-.25,worldZ:-16.5,rotationY:.08});s.markNoRaycast(u.root),t.add(u.root)}const l=s.trackGeometry(new Xe(6.5,6.5)),c=[[-9.5,.12,-2.5,.28],[9.8,.14,1.5,.25],[-2.5,.16,-13.2,.34],[5.5,.15,-13.5,.3],[-4,.12,10.5,.26],[5.2,.13,10.2,.24],[-11.5,.18,-9,.32],[11,.16,-7.5,.28]];for(let d=0;d<c.length;d++){const[u,f,g,_]=c[d],m=s.trackMaterial(new bt({map:e.mistTex,color:10405320,transparent:!0,opacity:_,depthWrite:!1,side:oe})),p=new R(l,m);p.rotation.x=-Math.PI/2,p.position.set(u,f,g),s.markNoRaycast(p),t.add(p);const y=u,M=g,v=d*1.15+i()*.5;n.push({kind:"mist",update:(I,T)=>{p.position.x=y+Math.sin(T*.25+v)*.65,p.position.z=M+Math.cos(T*.18+v)*.45}})}const h=Yd(s,{variant:"swamp",radius:38,silhouetteColor:924191,skyPalette:{topColor:"#132128",midColor:"#1d323a",horizonColor:"#2d474d",groundColor:"#0e1a1f"}});t.add(h)}function Mx(s){const t=new Hd,e=new Tt,n=ii(s.seed??4042),i=px(t,s.seed??4042),r=[],o=[],a=[],l=[],c=[];return _x(t,e,s,i,r,o,a,n),vx(t,e,i,a,l,c),xx(t,e,i,a,l,c),yx(t,e,i,l,n),{group:e,tileMeshes:r,obstacleMeshes:o,occluders:a,animatedObjects:l,atmosphere:{backgroundColor:1253672,fogColor:1253672,fogDensity:.015,ambientColor:9021618,ambientIntensity:.45,hemiSkyColor:7051944,hemiGroundColor:1583396,hemiIntensity:.62,dirLightColor:14083826,dirLightIntensity:1.18,dirLightPosition:[-8,16,10],rimLightColor:6809849,rimLightIntensity:.4,pointLights:c},update:(d,u)=>{for(const f of l)f.update(d,u)},dispose:()=>{t.dispose()}}}const mi={movement:{color:3900150,opacity:.28},attackRange:{color:15680580,opacity:.12},healRange:{color:3462041,opacity:.14},validTarget:{color:16347926,opacity:.4}},Js=1,gi=.16;function rn(s){return`${s.x},${s.y}`}class Sx{constructor(t){B(this,"group",new Tt);B(this,"gridSize",8);B(this,"tileMeshes",[]);B(this,"obstacleMeshes",[]);B(this,"activeScenario",null);B(this,"occlusionItems",[]);B(this,"elapsed",0);B(this,"highlightGroup",new Tt);B(this,"pathGroup",new Tt);B(this,"floorTexture");B(this,"wallTexture");B(this,"tileGeo",new Q(.95,gi,.95));B(this,"tileMatLight");B(this,"tileMatDark");B(this,"wallMat");B(this,"highlightGeo",new Xe(.9,.9));B(this,"reachableMat",new bt({color:mi.movement.color,transparent:!0,opacity:mi.movement.opacity,depthWrite:!1}));B(this,"attackRangeMat",new bt({color:mi.attackRange.color,transparent:!0,opacity:mi.attackRange.opacity,depthWrite:!1}));B(this,"healRangeMat",new bt({color:mi.healRange.color,transparent:!0,opacity:mi.healRange.opacity,depthWrite:!1}));B(this,"attackableMat",new bt({color:mi.validTarget.color,transparent:!0,opacity:mi.validTarget.opacity,depthWrite:!1}));B(this,"skillTargetMat",new bt({color:11032055,transparent:!0,opacity:.55,depthWrite:!1}));B(this,"skillAreaMat",new bt({color:2282478,transparent:!0,opacity:.45,depthWrite:!1}));B(this,"hoverMoveMat",new bt({color:2278750,transparent:!0,opacity:.72,depthWrite:!1}));B(this,"hoverAttackMat",new bt({color:16347926,transparent:!0,opacity:.72,depthWrite:!1}));B(this,"hoverSkillMat",new bt({color:2282478,transparent:!0,opacity:.75,depthWrite:!1}));B(this,"healTargetMat",new bt({color:3462041,transparent:!0,opacity:.56,depthWrite:!1}));B(this,"hoverHealMat",new bt({color:16436245,transparent:!0,opacity:.78,depthWrite:!1}));B(this,"dangerMat",new bt({color:15680580,transparent:!0,opacity:.42,depthWrite:!1}));B(this,"dangerAmberMat",new bt({color:16347926,transparent:!0,opacity:.78,side:oe,depthWrite:!1}));B(this,"dangerRingGeo",new Ae(.32,.44,4));B(this,"pathMat",new bt({color:16436245,depthWrite:!1}));const e=new Od;this.floorTexture=e.load("/assets/textures/stone-floor.png"),this.floorTexture.colorSpace=be,this.floorTexture.wrapS=ln,this.floorTexture.wrapT=ln,this.wallTexture=e.load("/assets/textures/stone-wall.png"),this.wallTexture.colorSpace=be,this.wallTexture.wrapS=ln,this.wallTexture.wrapT=ln,this.tileMatLight=new et({map:this.floorTexture,color:13358561,roughness:.85,metalness:.05}),this.tileMatDark=new et({map:this.floorTexture,color:9741240,roughness:.88,metalness:.05}),this.wallMat=new et({map:this.wallTexture,color:12108496,roughness:.85,metalness:.06}),this.group.add(this.highlightGroup),this.group.add(this.pathGroup),t.add(this.group)}gridToWorld(t,e=0){const n=(this.gridSize-1)/2;return new L((t.x-n)*Js,e,(n-t.y)*Js)}buildBoard(t,e,n="ruins"){const i=typeof n=="string"?{mapId:n}:n,r=i.theme,o=i.mapId??r??"ruins",a=i.bridgeCells??[];if(this.gridSize=t,this.elapsed=0,this.clearActiveScenario(),this.disposeBoardChildren(),this.tileMeshes=[],this.obstacleMeshes=[],o==="forgotten-swamp"||o==="fortress"){const H={gridSize:t,obstacleDefs:e,bridgeCells:a},z=o==="forgotten-swamp"?Mx(H):fx(H);this.activeScenario=z,this.group.add(z.group),this.tileMeshes.push(...z.tileMeshes),this.obstacleMeshes.push(...z.obstacleMeshes),this.occlusionItems=z.occluders.map(V=>({id:V.id,centerX:(V.bounds.minX+V.bounds.maxX)/2,centerZ:(V.bounds.minZ+V.bounds.maxZ)/2,halfWidth:(V.bounds.maxX-V.bounds.minX)/2,halfDepth:(V.bounds.maxZ-V.bounds.minZ)/2,height:V.bounds.maxY,category:V.bounds.maxY>=2.2?"tall":"mid"}));return}const l=o==="fortress"||r==="fortress",c=o==="sanctuary"||r==="sanctuary",h=o==="swamp"||r==="swamp",d=t*Js+.65,u=.38,f=c?1840152:l?2700616:h?2043172:3359061,g=new et({color:f,roughness:.9,metalness:c?.16:.08}),_=new R(new Q(d,u,d),g);_.position.set(0,-gi/2-u/2,0),_.receiveShadow=!0,this.group.add(_);const m=t*Js+1.4,p=.48,y=c?1314064:l?1976635:h?1450523:2437186,M=new et({color:y,roughness:.94}),v=new R(new Q(m,p,m),M);v.position.set(0,-gi/2-u-p/2,0),v.receiveShadow=!0,this.group.add(v);const I=t*Js+2.15,T=.65,E=new et({color:c?788233:1449774,roughness:.96}),C=new R(new Q(I,T,I),E);C.position.set(0,-gi/2-u-p-T/2,0),C.receiveShadow=!0,this.group.add(C);const S=new et({color:c?4524554:2972220,emissive:c?8330525:0,emissiveIntensity:c?.35:0,roughness:.92}),x=m/2-.14,P=-gi/2-u+.02,F=[[-x*.65,x,1.4,.28],[x*.45,x,1.1,.28],[-x*.5,-x,1.3,.28],[x,-x*.55,.28,1.4],[-x,x*.4,.28,1.2]];for(const[H,z,V,J]of F){const W=new R(new Q(V,.07,J),S);W.position.set(H,P,z),W.receiveShadow=!0,this.group.add(W)}const N=new Set(e.filter(H=>H.kind==="water").map(H=>rn(H.pos)));for(let H=0;H<t;H++)for(let z=0;z<t;z++){const V=(z+H)%2===0,J=N.has(rn({x:z,y:H})),W=new R(this.tileGeo,V?this.tileMatLight:this.tileMatDark),rt=J?-gi/2-.08:-gi/2;W.position.copy(this.gridToWorld({x:z,y:H},rt)),W.receiveShadow=!0,W.userData={kind:"tile",gridCoord:{x:z,y:H}},this.group.add(W),this.tileMeshes.push(W)}this.buildPerimeterScenery(t,o,r);for(const H of e)this.buildObstacle(H);for(const H of a)this.buildBridgeCell(H)}buildPerimeterScenery(t,e,n){const i=t/2,r=i+.95,o=i+.65,a=i+.55,l=e==="sanctuary"||n==="sanctuary",c=e==="fortress"||n==="fortress",h=e==="swamp"||n==="swamp",d=e==="catacombs"||n==="catacombs",u=new Q(t+2.7,.28,t+2.7),f=new et({color:l?1577237:h?1582622:1976635,roughness:.95}),g=new R(u,f);g.position.set(0,-gi-.34,0),g.receiveShadow=!0,this.group.add(g);const _=[[-o,-o],[o,-o],[-o,o],[o,o]],m=new et({color:l?1841431:c?2565930:4674921,roughness:.6,metalness:c||l?.5:.1}),p=l?15680580:d?1096065:16486972,y=new bt({color:p});for(const[E,C]of _){const S=new R(new Q(.42,c||l?1.15:1.35,.42),c||l?m:this.wallMat);S.position.set(E,.45,C),S.castShadow=!0,S.receiveShadow=!0;const x=new R(new Yt(.28,.16,.25,6),m);x.position.set(E,c||l?1.12:1.25,C);const P=new R(new Pe(.18,.42,6),y);P.position.set(E,c||l?1.42:1.54,C),this.group.add(S,x,P)}if(l){const E=new et({color:1841431,roughness:.75,metalness:.25}),C=new et({color:16347926,emissive:14427686,emissiveIntensity:.85,roughness:.35}),S=[[-i*.5,-r,2],[i*.5,-r,2],[-r,-i*.45,1.7],[r,-i*.45,1.7]];for(const[P,F,N]of S){const H=new R(new Q(.54,N,.54),E);H.position.set(P,N/2-.15,F),H.castShadow=!0,H.receiveShadow=!0;const z=new R(new gn(.18,0),C);z.position.set(P,N+.08,F),this.group.add(H,z)}const x=[[-a,-i*.2],[-a,i*.55],[-i*.25,-a-.15],[i*.25,-a-.15],[a+.12,i*.3],[-i*.45,a+.12]];for(const[P,F]of x){const N=new R(new Wi(.16,0),C);N.scale.set(1.25,.45,1.15),N.position.set(P,.02,F),this.group.add(N)}return}if(h){const E=new et({color:2972220,roughness:.92}),C=new et({color:4153874,roughness:.9}),S=[[-a,-i*.65],[-a,i*.4],[-i*.3,-a-.1],[i*.4,-a-.1],[a+.1,-i*.25],[i*.5,a+.1]];for(const[x,P]of S){const F=new R(new Wi(.24,0),E);F.scale.set(1.4,.55,1.3),F.position.set(x,.03,P);const N=new R(new Yt(.03,.04,.65,5),C);N.position.set(x+.08,.3,P-.06),this.group.add(F,N)}return}if(c){const E=[{x:-i*.45,y:.95,z:-r,w:t*.45,h:1.9,d:.55},{x:i*.45,y:.95,z:-r,w:t*.45,h:1.9,d:.55},{x:-r,y:.9,z:-i*.45,w:.55,h:1.8,d:t*.45},{x:-r,y:.9,z:i*.45,w:.55,h:1.8,d:t*.45},{x:r,y:.35,z:-i*.5,w:.45,h:.7,d:t*.35},{x:i*.5,y:.35,z:r,w:t*.35,h:.7,d:.45}];for(const F of E){const N=new R(new Q(F.w,F.h,F.d),this.wallMat);N.position.set(F.x,F.y-.2,F.z),N.castShadow=!0,N.receiveShadow=!0,this.group.add(N)}for(let F=-2;F<=2;F++){const N=new R(new Q(.55,.35,.58),this.wallMat);N.position.set(F*2,1.85,-r),N.castShadow=!0,this.group.add(N)}const C=new et({color:4144966,metalness:.5}),S=new et({color:1920728,roughness:.85}),x=new et({color:10033947,roughness:.85}),P=[[-i*.65,r+.15,S],[i*.65,-r-.15,x]];for(const[F,N,H]of P){const z=new R(new Yt(.04,.04,1.9,6),C);z.position.set(F,.85,N);const V=new R(new Q(.48,1.15,.05),H);V.position.set(F,1.15,N),V.castShadow=!0,this.group.add(z,V)}return}if(e==="courtyard"){const E=[[-i*.55,-r,1.6],[-i*.25,-r,1.3],[-r,-i*.5,1.5],[r,-i*.55,.7]];for(const[P,F,N]of E){const H=new R(new Q(.55,N,.55),this.wallMat);H.position.set(P,N/2-.15,F),H.castShadow=!0,H.receiveShadow=!0,this.group.add(H)}const C=new R(new Q(i*.35+.6,.35,.55),this.wallMat);C.position.set(-i*.4,1.5,-r),C.castShadow=!0,this.group.add(C);const S=new et({color:2972220,roughness:.9}),x=[[-a,-i*.7],[-a,i*.35],[-i*.2,-a-.12],[i*.55,-a-.12],[a+.12,-i*.2],[i*.4,a+.12]];for(const[P,F]of x){const N=new R(new Wi(.24,0),S);N.scale.set(1.35,.7,1.25),N.position.set(P,.05,F),this.group.add(N)}return}const M=[{x:-i*.55,y:.9,z:-r,w:t*.4,h:1.8,d:.5},{x:i*.45,y:.65,z:-r,w:t*.35,h:1.3,d:.5},{x:-r,y:.85,z:-i*.5,w:.5,h:1.7,d:t*.42},{x:-r,y:.5,z:i*.52,w:.5,h:1,d:t*.3},{x:r,y:.35,z:-i*.6,w:.45,h:.7,d:t*.28},{x:i*.65,y:.3,z:r,w:t*.25,h:.6,d:.45}];for(const E of M){const C=new R(new Q(E.w,E.h,E.d),this.wallMat);C.position.set(E.x,E.y-.2,E.z),C.castShadow=!0,C.receiveShadow=!0,this.group.add(C)}const v=new R(new Q(2.1,.32,.52),this.wallMat);v.position.set(0,1.65,-r),v.castShadow=!0,this.group.add(v);const I=new et({color:2972220,roughness:.9}),T=[[-a,-i*.75],[-a,i*.2],[-i*.25,-a-.1],[i*.8,-a-.1],[a+.1,-i*.3]];for(const[E,C]of T){const S=new R(new Wi(.22,0),I);S.scale.set(1.3,.65,1.2),S.position.set(E,.05,C),this.group.add(S)}}buildObstacle(t){const e=new Tt;e.position.copy(this.gridToWorld(t.pos,0));const n=[];if(t.kind==="pillar"){const i=new R(new Q(.84,.18,.84),this.wallMat);i.position.y=.09,i.castShadow=!0,i.receiveShadow=!0;const r=new R(new Q(.64,.72,.64),this.wallMat);r.position.y=.54,r.castShadow=!0,r.receiveShadow=!0;const o=new R(new Q(.76,.14,.76),this.wallMat);o.position.y=.97,o.castShadow=!0,o.receiveShadow=!0,e.add(i,r,o),n.push(i,r,o)}else if(t.kind==="wall"){const i=new R(new Q(.88,.64,.84),this.wallMat);i.position.y=.32,i.castShadow=!0,i.receiveShadow=!0;const r=new R(new Q(.92,.12,.88),this.wallMat);r.position.y=.7,r.castShadow=!0,r.receiveShadow=!0,e.add(i,r),n.push(i,r)}else if(t.kind==="crate"){const i=new et({color:9132587,roughness:.85}),r=new et({color:6044187,roughness:.9}),o=new R(new Q(.72,.64,.72),i);o.position.y=.32,o.castShadow=!0,o.receiveShadow=!0;const a=new R(new Q(.76,.1,.76),r);a.position.y=.62,a.castShadow=!0,e.add(o,a),n.push(o,a)}else if(t.kind==="water"){const i=new et({color:1985851,emissive:993568,emissiveIntensity:.25,roughness:.16,metalness:.1,transparent:!0,opacity:.78}),r=new R(new Xe(.96,.96),i);r.rotation.x=-Math.PI/2,r.position.y=-.035,r.receiveShadow=!0,r.userData={gridCoord:t.pos,obstacleKind:"water"},e.add(r)}else{const i=new et({color:8146213,roughness:.82}),r=new et({color:3359061,roughness:.5,metalness:.5}),o=new R(new Yt(.32,.34,.68,10),i);o.position.y=.34,o.castShadow=!0,o.receiveShadow=!0;const a=new R(new Yt(.335,.335,.08,10),r);a.position.y=.54;const l=new R(new Yt(.345,.345,.08,10),r);l.position.y=.16,e.add(o,a,l),n.push(o,a,l)}if(n.length>0){const i={kind:"obstacle",obstacleKind:t.kind,gridCoord:{x:t.pos.x,y:t.pos.y}};for(const r of n)r.userData=i,this.obstacleMeshes.push(r)}this.group.add(e)}buildBridgeCell(t){const e=new Tt;e.position.copy(this.gridToWorld(t,0));const n=new et({color:8146213,roughness:.86}),i=new et({color:6044187,roughness:.9});for(let a=-1;a<=1;a++){const l=new R(new Q(.92,.05,.24),n);l.position.set(0,-.028,a*.3),l.receiveShadow=!0,l.castShadow=!0,l.userData={gridCoord:t,isBridge:!0},e.add(l)}const r=new R(new Q(.08,.09,.94),i);r.position.set(-.42,.017,0),r.castShadow=!0;const o=new R(new Q(.08,.09,.94),i);o.position.set(.42,.017,0),o.castShadow=!0,e.add(r,o),this.group.add(e)}getTileMeshes(){return this.tileMeshes}getObstacleMeshes(){return this.obstacleMeshes}getAtmosphere(){var e;const t=(e=this.activeScenario)==null?void 0:e.atmosphere;return t?{backgroundColor:t.backgroundColor,fogColor:t.fogColor,fogDensity:t.fogDensity,ambientColor:t.ambientColor,ambientIntensity:t.ambientIntensity,hemiSkyColor:t.hemiSkyColor,hemiGroundColor:t.hemiGroundColor,hemiIntensity:t.hemiIntensity,dirColor:t.dirLightColor,dirIntensity:t.dirLightIntensity,dirPosition:t.dirLightPosition,rimColor:t.rimLightColor,rimIntensity:t.rimLightIntensity,pointLights:t.pointLights.map(n=>({position:n.position,color:n.color,intensity:n.intensity,distance:n.distance,decay:n.decay}))}:null}update(t,e){if(this.elapsed+=t,!!this.activeScenario&&(this.activeScenario.update(t,this.elapsed),this.occlusionItems.length>0)){const n=Qv(this.occlusionItems,e);for(const i of this.activeScenario.occluders)i.upperGroup.visible=!n.has(i.id)}}setHighlights(t){this.clearGroup(this.highlightGroup,!1),this.clearGroup(this.pathGroup,!0);const e=t.hoverCell?rn(t.hoverCell):null,n=new Set(t.skillArea.map(rn));for(const a of t.reachable){const l=e===rn(a);this.addTileHighlight(a,l?this.hoverMoveMat:this.reachableMat,l?.02:.012)}const i=t.skillMode==="ally",r=new Set(t.attackable.map(rn)),o=new Set(t.skillTargets.map(rn));for(const a of t.attackRangeCells??[])r.has(rn(a))||this.addTileHighlight(a,this.attackRangeMat,.01);for(const a of t.skillRangeCells??[]){const l=rn(a);o.has(l)||n.has(l)||this.addTileHighlight(a,i?this.healRangeMat:this.attackRangeMat,.01)}for(const a of t.attackable){const l=e===rn(a);this.addTileHighlight(a,l?this.hoverAttackMat:this.attackableMat,l?.022:.014)}for(const a of t.skillTargets){const l=rn(a),c=e===l;if(n.has(l)&&!c)continue;const h=i?c?this.hoverHealMat:this.healTargetMat:c?this.hoverSkillMat:this.skillTargetMat;this.addTileHighlight(a,h,c?.024:.016)}for(const a of t.skillArea)e===rn(a)||this.addTileHighlight(a,this.skillAreaMat,.021);for(const a of t.dangerCells??[]){this.addTileHighlight(a,this.dangerMat,.015);const l=new R(this.dangerRingGeo,this.dangerAmberMat);l.rotation.x=-Math.PI/2,l.rotation.z=Math.PI/4,l.position.copy(this.gridToWorld(a,.017)),l.raycast=()=>{},this.highlightGroup.add(l)}t.path&&t.path.length>=2&&this.renderPathPreview(t.path)}addTileHighlight(t,e,n){const i=new R(this.highlightGeo,e);i.rotation.x=-Math.PI/2,i.position.copy(this.gridToWorld(t,n)),i.raycast=()=>{},this.highlightGroup.add(i)}renderPathPreview(t){for(let h=0;h<t.length-1;h++){const d=this.gridToWorld(t[h],.036),u=this.gridToWorld(t[h+1],.036),f=u.x-d.x,g=u.z-d.z,_=Math.hypot(f,g),m=new Q(.14,.02,_+.14*.6),p=new R(m,this.pathMat);p.position.set((d.x+u.x)/2,.036,(d.z+u.z)/2),p.rotation.y=Math.atan2(f,g),this.pathGroup.add(p)}const i=this.gridToWorld(t[t.length-2],.036),r=this.gridToWorld(t[t.length-1],.036),o=r.x-i.x,a=r.z-i.z,l=new Pe(.18,.3,4);l.rotateX(Math.PI/2);const c=new R(l,this.pathMat);c.position.copy(r),c.rotation.y=Math.atan2(o,a),this.pathGroup.add(c)}clearGroup(t,e){for(;t.children.length>0;){const n=t.children[0];t.remove(n),e&&n instanceof R&&n.geometry.dispose()}}disposeBoardChildren(){const t=new Set([this.tileGeo,this.highlightGeo,this.dangerRingGeo]),e=new Set([this.tileMatLight,this.tileMatDark,this.wallMat]),n=new Set;for(let i=this.group.children.length-1;i>=0;i--){const r=this.group.children[i];r===this.highlightGroup||r===this.pathGroup||(this.group.remove(r),r.traverse(o=>{if(o instanceof R){o.geometry&&!t.has(o.geometry)&&o.geometry.dispose();const a=Array.isArray(o.material)?o.material:[o.material];for(const l of a)l&&!e.has(l)&&!n.has(l)&&(n.add(l),l.dispose())}}))}}clearActiveScenario(){this.activeScenario&&(this.group.remove(this.activeScenario.group),this.activeScenario.dispose(),this.activeScenario=null),this.occlusionItems=[]}dispose(){this.clearActiveScenario(),this.tileMeshes=[],this.obstacleMeshes=[],this.disposeBoardChildren(),this.clearGroup(this.highlightGroup,!1),this.clearGroup(this.pathGroup,!0),this.tileGeo.dispose(),this.highlightGeo.dispose(),this.dangerRingGeo.dispose(),this.tileMatLight.dispose(),this.tileMatDark.dispose(),this.wallMat.dispose(),this.floorTexture.dispose(),this.wallTexture.dispose(),this.reachableMat.dispose(),this.attackRangeMat.dispose(),this.healRangeMat.dispose(),this.attackableMat.dispose(),this.skillTargetMat.dispose(),this.skillAreaMat.dispose(),this.hoverMoveMat.dispose(),this.hoverAttackMat.dispose(),this.hoverSkillMat.dispose(),this.healTargetMat.dispose(),this.hoverHealMat.dispose(),this.dangerMat.dispose(),this.dangerAmberMat.dispose(),this.pathMat.dispose()}}const Rh=Math.PI/4,wx=12.8,bx=20,ca=4,Ex=.008;class Ax{constructor(t,e=null){B(this,"target",new L(0,.35,0));B(this,"heightY",wx);B(this,"radius",bx);B(this,"targetAzimuth",Rh);B(this,"currentAzimuth",Rh);B(this,"camera");B(this,"canvas");B(this,"draggingRight",!1);B(this,"dragDistance",0);B(this,"lastX",0);B(this,"lastY",0);B(this,"suppressContextMenu",!1);B(this,"handlePointerDownBound");B(this,"handlePointerMoveBound");B(this,"handlePointerUpBound");B(this,"handleContextMenuBound");B(this,"handleWheelBound");B(this,"handleGestureStartBound");B(this,"handleKeyDownBound");this.camera=t,this.canvas=e,this.applyCameraTransform(),this.handlePointerDownBound=n=>{n.button===2&&this.beginRightDrag(n.clientX,n.clientY)},this.handlePointerMoveBound=n=>{this.draggingRight&&this.moveRightDrag(n.clientX,n.clientY)},this.handlePointerUpBound=n=>{n.button===2&&this.draggingRight&&this.endRightDrag()},this.handleContextMenuBound=n=>{n.preventDefault()},this.handleWheelBound=n=>{n.preventDefault()},this.handleGestureStartBound=n=>{n.preventDefault()},this.handleKeyDownBound=n=>{(n.ctrlKey||n.metaKey)&&(n.key==="+"||n.key==="-"||n.key==="="||n.key==="_"||n.key==="0")&&n.preventDefault()},this.canvas&&(this.canvas.addEventListener("pointerdown",this.handlePointerDownBound),this.canvas.addEventListener("contextmenu",this.handleContextMenuBound),this.canvas.addEventListener("wheel",this.handleWheelBound,{passive:!1}),typeof window<"u"&&(window.addEventListener("pointermove",this.handlePointerMoveBound),window.addEventListener("pointerup",this.handlePointerUpBound),window.addEventListener("gesturestart",this.handleGestureStartBound,{passive:!1}),window.addEventListener("keydown",this.handleKeyDownBound)))}get isDragging(){return this.draggingRight&&this.dragDistance>=ca}get wasRightDrag(){return this.suppressContextMenu||this.dragDistance>=ca}consumeRightDrag(){const t=this.wasRightDrag;return this.suppressContextMenu=!1,this.dragDistance=0,t}beginRightDrag(t,e){this.draggingRight=!0,this.dragDistance=0,this.lastX=t,this.lastY=e,this.suppressContextMenu=!1}moveRightDrag(t,e){if(!this.draggingRight)return;const n=t-this.lastX,i=e-this.lastY;this.lastX=t,this.lastY=e,this.dragDistance+=Math.hypot(n,i),this.targetAzimuth-=n*Ex}endRightDrag(){this.draggingRight&&(this.dragDistance>=ca&&(this.suppressContextMenu=!0),this.draggingRight=!1)}update(t){const e=1-Math.exp(-12*Math.max(0,t));this.currentAzimuth+=(this.targetAzimuth-this.currentAzimuth)*e,this.applyCameraTransform()}applyCameraTransform(){this.camera.position.set(Math.sin(this.currentAzimuth)*this.radius,this.heightY,Math.cos(this.currentAzimuth)*this.radius),this.camera.lookAt(this.target)}dispose(){this.canvas&&(this.canvas.removeEventListener("pointerdown",this.handlePointerDownBound),this.canvas.removeEventListener("contextmenu",this.handleContextMenuBound),this.canvas.removeEventListener("wheel",this.handleWheelBound),typeof window<"u"&&(window.removeEventListener("pointermove",this.handlePointerMoveBound),window.removeEventListener("pointerup",this.handlePointerUpBound),window.removeEventListener("gesturestart",this.handleGestureStartBound),window.removeEventListener("keydown",this.handleKeyDownBound)))}}class Tx{constructor(t){B(this,"scene");B(this,"camera");B(this,"renderer");B(this,"cameraController");B(this,"canvas");B(this,"frustumSize",14.8);B(this,"torchLights",[]);B(this,"ambientLight");B(this,"hemiLight");B(this,"dirLight");B(this,"rimLight");B(this,"rafId",null);B(this,"lastTime",0);B(this,"elapsed",0);B(this,"onFrameCallback",null);B(this,"handleResizeBound");this.canvas=t,this.scene=new av,this.scene.background=new It(791588),this.scene.fog=new ao(791588,.012);const e=this.getAspect();this.camera=new So(-this.frustumSize*e/2,this.frustumSize*e/2,this.frustumSize/2,-this.frustumSize/2,.1,100),this.camera.position.set(Math.SQRT1_2*20,12.8,Math.SQRT1_2*20),this.camera.lookAt(0,.35,0),this.cameraController=new Ax(this.camera,this.canvas),this.renderer=new ov({canvas:this.canvas,antialias:!0,powerPreference:"high-performance"}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)),this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=jh,this.renderer.toneMapping=Jh,this.renderer.toneMappingExposure=1.08,this.renderer.outputColorSpace=be,this.setupLights(),this.handleResizeBound=()=>this.resize(),window.addEventListener("resize",this.handleResizeBound),this.resize()}setupLights(){this.ambientLight=new Nv(9741240,.48),this.scene.add(this.ambientLight),this.hemiLight=new Rv(9356776,1979702,.62),this.scene.add(this.hemiLight),this.dirLight=new ol(16773590,1.38),this.dirLight.position.set(11,18,8),this.dirLight.castShadow=!0,this.dirLight.shadow.mapSize.width=2048,this.dirLight.shadow.mapSize.height=2048,this.dirLight.shadow.camera.near=1,this.dirLight.shadow.camera.far=55;const t=13.5;this.dirLight.shadow.camera.left=-t,this.dirLight.shadow.camera.right=t,this.dirLight.shadow.camera.top=t,this.dirLight.shadow.camera.bottom=-t,this.dirLight.shadow.bias=-5e-4,this.scene.add(this.dirLight),this.rimLight=new ol(8246268,.55),this.rimLight.position.set(-10,10,-11),this.scene.add(this.rimLight),[[-6.65,1.75,-6.65],[6.65,1.75,-6.65],[-6.65,1.75,6.65],[6.65,1.75,6.65]].forEach(([n,i,r],o)=>{const a=new Bd(16096779,3.6,14,1.5);a.position.set(n,i,r),this.scene.add(a),this.torchLights.push({light:a,baseIntensity:3.2,phase:o*1.7})})}applyAtmosphere(t){if(t.backgroundColor!==void 0&&(this.scene.background instanceof It?this.scene.background.setHex(t.backgroundColor):this.scene.background=new It(t.backgroundColor)),this.scene.fog instanceof ao&&(t.fogColor!==void 0&&this.scene.fog.color.setHex(t.fogColor),t.fogDensity!==void 0&&(this.scene.fog.density=t.fogDensity)),t.ambientColor!==void 0&&this.ambientLight.color.setHex(t.ambientColor),t.ambientIntensity!==void 0&&(this.ambientLight.intensity=t.ambientIntensity),t.hemiSkyColor!==void 0&&this.hemiLight.color.setHex(t.hemiSkyColor),t.hemiGroundColor!==void 0&&this.hemiLight.groundColor.setHex(t.hemiGroundColor),t.hemiIntensity!==void 0&&(this.hemiLight.intensity=t.hemiIntensity),t.dirColor!==void 0&&this.dirLight.color.setHex(t.dirColor),t.dirIntensity!==void 0&&(this.dirLight.intensity=t.dirIntensity),t.dirPosition!==void 0&&this.dirLight.position.set(t.dirPosition[0],t.dirPosition[1],t.dirPosition[2]),t.rimColor!==void 0&&this.rimLight.color.setHex(t.rimColor),t.rimIntensity!==void 0&&(this.rimLight.intensity=t.rimIntensity),t.rimPosition!==void 0&&this.rimLight.position.set(t.rimPosition[0],t.rimPosition[1],t.rimPosition[2]),t.pointLights!==void 0)for(let e=0;e<this.torchLights.length;e++){const n=this.torchLights[e],i=t.pointLights[e];if(i){n.light.position.set(i.position[0],i.position[1],i.position[2]),i.color!==void 0&&n.light.color.setHex(i.color),i.distance!==void 0&&(n.light.distance=i.distance),i.decay!==void 0&&(n.light.decay=i.decay);const r=i.intensity??3.2;n.baseIntensity=r,n.light.intensity=r,n.light.visible=r>0}else n.baseIntensity=0,n.light.intensity=0,n.light.visible=!1}}getAspect(){const t=this.canvas.clientWidth||window.innerWidth||1,e=this.canvas.clientHeight||window.innerHeight||1;return t/e}resize(){const t=window.innerWidth,e=window.innerHeight,n=t/Math.max(e,1),i=n<1?this.frustumSize/n:this.frustumSize,r=i*n;this.camera.left=-r/2,this.camera.right=r/2,this.camera.top=i/2,this.camera.bottom=-i/2,this.camera.updateProjectionMatrix(),this.renderer.setSize(t,e,!1)}start(t){this.onFrameCallback=t,this.lastTime=performance.now();const e=n=>{var r;const i=Math.min((n-this.lastTime)/1e3,.1);this.lastTime=n,this.elapsed+=i;for(const o of this.torchLights){if(o.baseIntensity<=0){o.light.intensity=0;continue}const a=Math.sin(this.elapsed*7.5+o.phase)*.25+Math.sin(this.elapsed*13.1+o.phase*2)*.12;o.light.intensity=Math.max(0,o.baseIntensity+a)}this.cameraController.update(i),(r=this.onFrameCallback)==null||r.call(this,i),this.renderer.render(this.scene,this.camera),this.rafId=requestAnimationFrame(e)};this.rafId=requestAnimationFrame(e)}dispose(){this.rafId!==null&&(cancelAnimationFrame(this.rafId),this.rafId=null),window.removeEventListener("resize",this.handleResizeBound),this.cameraController.dispose(),this.renderer.dispose()}}function Ih(s,t){if(t===yf)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),s;if(t===tl||t===ud){let e=s.getIndex();if(e===null){const o=[],a=s.getAttribute("position");if(a!==void 0){for(let l=0;l<a.count;l++)o.push(l);s.setIndex(o),e=s.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),s}const n=e.count-2,i=[];if(t===tl)for(let o=1;o<=n;o++)i.push(e.getX(0)),i.push(e.getX(o)),i.push(e.getX(o+1));else for(let o=0;o<n;o++)o%2===0?(i.push(e.getX(o)),i.push(e.getX(o+1)),i.push(e.getX(o+2))):(i.push(e.getX(o+2)),i.push(e.getX(o+1)),i.push(e.getX(o)));i.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");const r=s.clone();return r.setIndex(i),r.clearGroups(),r}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",t),s}class Cx extends Hs{constructor(t){super(t),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(e){return new Dx(e)}),this.register(function(e){return new Nx(e)}),this.register(function(e){return new Vx(e)}),this.register(function(e){return new Wx(e)}),this.register(function(e){return new Xx(e)}),this.register(function(e){return new kx(e)}),this.register(function(e){return new Fx(e)}),this.register(function(e){return new Ox(e)}),this.register(function(e){return new Bx(e)}),this.register(function(e){return new Lx(e)}),this.register(function(e){return new Hx(e)}),this.register(function(e){return new Ux(e)}),this.register(function(e){return new zx(e)}),this.register(function(e){return new Gx(e)}),this.register(function(e){return new Ix(e)}),this.register(function(e){return new Yx(e)}),this.register(function(e){return new qx(e)})}load(t,e,n,i){const r=this;let o;if(this.resourcePath!=="")o=this.resourcePath;else if(this.path!==""){const c=or.extractUrlBase(t);o=or.resolveURL(c,this.path)}else o=or.extractUrlBase(t);this.manager.itemStart(t);const a=function(c){i?i(c):console.error(c),r.manager.itemError(t),r.manager.itemEnd(t)},l=new Fd(this.manager);l.setPath(this.path),l.setResponseType("arraybuffer"),l.setRequestHeader(this.requestHeader),l.setWithCredentials(this.withCredentials),l.load(t,function(c){try{r.parse(c,o,function(h){e(h),r.manager.itemEnd(t)},a)}catch(h){a(h)}},n,a)}setDRACOLoader(t){return this.dracoLoader=t,this}setKTX2Loader(t){return this.ktx2Loader=t,this}setMeshoptDecoder(t){return this.meshoptDecoder=t,this}register(t){return this.pluginCallbacks.indexOf(t)===-1&&this.pluginCallbacks.push(t),this}unregister(t){return this.pluginCallbacks.indexOf(t)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(t),1),this}parse(t,e,n,i){let r;const o={},a={},l=new TextDecoder;if(typeof t=="string")r=JSON.parse(t);else if(t instanceof ArrayBuffer)if(l.decode(new Uint8Array(t,0,4))===$d){try{o[Xt.KHR_BINARY_GLTF]=new $x(t)}catch(d){i&&i(d);return}r=JSON.parse(o[Xt.KHR_BINARY_GLTF].content)}else r=JSON.parse(l.decode(t));else r=t;if(r.asset===void 0||r.asset.version[0]<2){i&&i(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}const c=new ay(r,{path:e||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});c.fileLoader.setRequestHeader(this.requestHeader);for(let h=0;h<this.pluginCallbacks.length;h++){const d=this.pluginCallbacks[h](c);d.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),a[d.name]=d,o[d.name]=!0}if(r.extensionsUsed)for(let h=0;h<r.extensionsUsed.length;++h){const d=r.extensionsUsed[h],u=r.extensionsRequired||[];switch(d){case Xt.KHR_MATERIALS_UNLIT:o[d]=new Px;break;case Xt.KHR_DRACO_MESH_COMPRESSION:o[d]=new Kx(r,this.dracoLoader);break;case Xt.KHR_TEXTURE_TRANSFORM:o[d]=new jx;break;case Xt.KHR_MESH_QUANTIZATION:o[d]=new Zx;break;default:u.indexOf(d)>=0&&a[d]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+d+'".')}}c.setExtensions(o),c.setPlugins(a),c.parse(n,i)}parseAsync(t,e){const n=this;return new Promise(function(i,r){n.parse(t,e,i,r)})}}function Rx(){let s={};return{get:function(t){return s[t]},add:function(t,e){s[t]=e},remove:function(t){delete s[t]},removeAll:function(){s={}}}}const Xt={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"};class Ix{constructor(t){this.parser=t,this.name=Xt.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){const t=this.parser,e=this.parser.json.nodes||[];for(let n=0,i=e.length;n<i;n++){const r=e[n];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&t._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(t){const e=this.parser,n="light:"+t;let i=e.cache.get(n);if(i)return i;const r=e.json,l=((r.extensions&&r.extensions[this.name]||{}).lights||[])[t];let c;const h=new It(16777215);l.color!==void 0&&h.setRGB(l.color[0],l.color[1],l.color[2],Ye);const d=l.range!==void 0?l.range:0;switch(l.type){case"directional":c=new ol(h),c.target.position.set(0,0,-1),c.add(c.target);break;case"point":c=new Bd(h),c.distance=d;break;case"spot":c=new Pv(h),c.distance=d,l.spot=l.spot||{},l.spot.innerConeAngle=l.spot.innerConeAngle!==void 0?l.spot.innerConeAngle:0,l.spot.outerConeAngle=l.spot.outerConeAngle!==void 0?l.spot.outerConeAngle:Math.PI/4,c.angle=l.spot.outerConeAngle,c.penumbra=1-l.spot.innerConeAngle/l.spot.outerConeAngle,c.target.position.set(0,0,-1),c.add(c.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+l.type)}return c.position.set(0,0,0),c.decay=2,$n(c,l),l.intensity!==void 0&&(c.intensity=l.intensity),c.name=e.createUniqueName(l.name||"light_"+t),i=Promise.resolve(c),e.cache.add(n,i),i}getDependency(t,e){if(t==="light")return this._loadLight(e)}createNodeAttachment(t){const e=this,n=this.parser,r=n.json.nodes[t],a=(r.extensions&&r.extensions[this.name]||{}).light;return a===void 0?null:this._loadLight(a).then(function(l){return n._getNodeRef(e.cache,a,l)})}}class Px{constructor(){this.name=Xt.KHR_MATERIALS_UNLIT}getMaterialType(){return bt}extendParams(t,e,n){const i=[];t.color=new It(1,1,1),t.opacity=1;const r=e.pbrMetallicRoughness;if(r){if(Array.isArray(r.baseColorFactor)){const o=r.baseColorFactor;t.color.setRGB(o[0],o[1],o[2],Ye),t.opacity=o[3]}r.baseColorTexture!==void 0&&i.push(n.assignTexture(t,"map",r.baseColorTexture,be))}return Promise.all(i)}}class Lx{constructor(t){this.parser=t,this.name=Xt.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(t,e){const i=this.parser.json.materials[t];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=i.extensions[this.name].emissiveStrength;return r!==void 0&&(e.emissiveIntensity=r),Promise.resolve()}}class Dx{constructor(t){this.parser=t,this.name=Xt.KHR_MATERIALS_CLEARCOAT}getMaterialType(t){const n=this.parser.json.materials[t];return!n.extensions||!n.extensions[this.name]?null:Nn}extendMaterialParams(t,e){const n=this.parser,i=n.json.materials[t];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],o=i.extensions[this.name];if(o.clearcoatFactor!==void 0&&(e.clearcoat=o.clearcoatFactor),o.clearcoatTexture!==void 0&&r.push(n.assignTexture(e,"clearcoatMap",o.clearcoatTexture)),o.clearcoatRoughnessFactor!==void 0&&(e.clearcoatRoughness=o.clearcoatRoughnessFactor),o.clearcoatRoughnessTexture!==void 0&&r.push(n.assignTexture(e,"clearcoatRoughnessMap",o.clearcoatRoughnessTexture)),o.clearcoatNormalTexture!==void 0&&(r.push(n.assignTexture(e,"clearcoatNormalMap",o.clearcoatNormalTexture)),o.clearcoatNormalTexture.scale!==void 0)){const a=o.clearcoatNormalTexture.scale;e.clearcoatNormalScale=new zt(a,a)}return Promise.all(r)}}class Nx{constructor(t){this.parser=t,this.name=Xt.KHR_MATERIALS_DISPERSION}getMaterialType(t){const n=this.parser.json.materials[t];return!n.extensions||!n.extensions[this.name]?null:Nn}extendMaterialParams(t,e){const i=this.parser.json.materials[t];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=i.extensions[this.name];return e.dispersion=r.dispersion!==void 0?r.dispersion:0,Promise.resolve()}}class Ux{constructor(t){this.parser=t,this.name=Xt.KHR_MATERIALS_IRIDESCENCE}getMaterialType(t){const n=this.parser.json.materials[t];return!n.extensions||!n.extensions[this.name]?null:Nn}extendMaterialParams(t,e){const n=this.parser,i=n.json.materials[t];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],o=i.extensions[this.name];return o.iridescenceFactor!==void 0&&(e.iridescence=o.iridescenceFactor),o.iridescenceTexture!==void 0&&r.push(n.assignTexture(e,"iridescenceMap",o.iridescenceTexture)),o.iridescenceIor!==void 0&&(e.iridescenceIOR=o.iridescenceIor),e.iridescenceThicknessRange===void 0&&(e.iridescenceThicknessRange=[100,400]),o.iridescenceThicknessMinimum!==void 0&&(e.iridescenceThicknessRange[0]=o.iridescenceThicknessMinimum),o.iridescenceThicknessMaximum!==void 0&&(e.iridescenceThicknessRange[1]=o.iridescenceThicknessMaximum),o.iridescenceThicknessTexture!==void 0&&r.push(n.assignTexture(e,"iridescenceThicknessMap",o.iridescenceThicknessTexture)),Promise.all(r)}}class kx{constructor(t){this.parser=t,this.name=Xt.KHR_MATERIALS_SHEEN}getMaterialType(t){const n=this.parser.json.materials[t];return!n.extensions||!n.extensions[this.name]?null:Nn}extendMaterialParams(t,e){const n=this.parser,i=n.json.materials[t];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[];e.sheenColor=new It(0,0,0),e.sheenRoughness=0,e.sheen=1;const o=i.extensions[this.name];if(o.sheenColorFactor!==void 0){const a=o.sheenColorFactor;e.sheenColor.setRGB(a[0],a[1],a[2],Ye)}return o.sheenRoughnessFactor!==void 0&&(e.sheenRoughness=o.sheenRoughnessFactor),o.sheenColorTexture!==void 0&&r.push(n.assignTexture(e,"sheenColorMap",o.sheenColorTexture,be)),o.sheenRoughnessTexture!==void 0&&r.push(n.assignTexture(e,"sheenRoughnessMap",o.sheenRoughnessTexture)),Promise.all(r)}}class Fx{constructor(t){this.parser=t,this.name=Xt.KHR_MATERIALS_TRANSMISSION}getMaterialType(t){const n=this.parser.json.materials[t];return!n.extensions||!n.extensions[this.name]?null:Nn}extendMaterialParams(t,e){const n=this.parser,i=n.json.materials[t];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],o=i.extensions[this.name];return o.transmissionFactor!==void 0&&(e.transmission=o.transmissionFactor),o.transmissionTexture!==void 0&&r.push(n.assignTexture(e,"transmissionMap",o.transmissionTexture)),Promise.all(r)}}class Ox{constructor(t){this.parser=t,this.name=Xt.KHR_MATERIALS_VOLUME}getMaterialType(t){const n=this.parser.json.materials[t];return!n.extensions||!n.extensions[this.name]?null:Nn}extendMaterialParams(t,e){const n=this.parser,i=n.json.materials[t];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],o=i.extensions[this.name];e.thickness=o.thicknessFactor!==void 0?o.thicknessFactor:0,o.thicknessTexture!==void 0&&r.push(n.assignTexture(e,"thicknessMap",o.thicknessTexture)),e.attenuationDistance=o.attenuationDistance||1/0;const a=o.attenuationColor||[1,1,1];return e.attenuationColor=new It().setRGB(a[0],a[1],a[2],Ye),Promise.all(r)}}class Bx{constructor(t){this.parser=t,this.name=Xt.KHR_MATERIALS_IOR}getMaterialType(t){const n=this.parser.json.materials[t];return!n.extensions||!n.extensions[this.name]?null:Nn}extendMaterialParams(t,e){const i=this.parser.json.materials[t];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=i.extensions[this.name];return e.ior=r.ior!==void 0?r.ior:1.5,Promise.resolve()}}class Hx{constructor(t){this.parser=t,this.name=Xt.KHR_MATERIALS_SPECULAR}getMaterialType(t){const n=this.parser.json.materials[t];return!n.extensions||!n.extensions[this.name]?null:Nn}extendMaterialParams(t,e){const n=this.parser,i=n.json.materials[t];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],o=i.extensions[this.name];e.specularIntensity=o.specularFactor!==void 0?o.specularFactor:1,o.specularTexture!==void 0&&r.push(n.assignTexture(e,"specularIntensityMap",o.specularTexture));const a=o.specularColorFactor||[1,1,1];return e.specularColor=new It().setRGB(a[0],a[1],a[2],Ye),o.specularColorTexture!==void 0&&r.push(n.assignTexture(e,"specularColorMap",o.specularColorTexture,be)),Promise.all(r)}}class Gx{constructor(t){this.parser=t,this.name=Xt.EXT_MATERIALS_BUMP}getMaterialType(t){const n=this.parser.json.materials[t];return!n.extensions||!n.extensions[this.name]?null:Nn}extendMaterialParams(t,e){const n=this.parser,i=n.json.materials[t];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],o=i.extensions[this.name];return e.bumpScale=o.bumpFactor!==void 0?o.bumpFactor:1,o.bumpTexture!==void 0&&r.push(n.assignTexture(e,"bumpMap",o.bumpTexture)),Promise.all(r)}}class zx{constructor(t){this.parser=t,this.name=Xt.KHR_MATERIALS_ANISOTROPY}getMaterialType(t){const n=this.parser.json.materials[t];return!n.extensions||!n.extensions[this.name]?null:Nn}extendMaterialParams(t,e){const n=this.parser,i=n.json.materials[t];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],o=i.extensions[this.name];return o.anisotropyStrength!==void 0&&(e.anisotropy=o.anisotropyStrength),o.anisotropyRotation!==void 0&&(e.anisotropyRotation=o.anisotropyRotation),o.anisotropyTexture!==void 0&&r.push(n.assignTexture(e,"anisotropyMap",o.anisotropyTexture)),Promise.all(r)}}class Vx{constructor(t){this.parser=t,this.name=Xt.KHR_TEXTURE_BASISU}loadTexture(t){const e=this.parser,n=e.json,i=n.textures[t];if(!i.extensions||!i.extensions[this.name])return null;const r=i.extensions[this.name],o=e.options.ktx2Loader;if(!o){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return e.loadTextureImage(t,r.source,o)}}class Wx{constructor(t){this.parser=t,this.name=Xt.EXT_TEXTURE_WEBP,this.isSupported=null}loadTexture(t){const e=this.name,n=this.parser,i=n.json,r=i.textures[t];if(!r.extensions||!r.extensions[e])return null;const o=r.extensions[e],a=i.images[o.source];let l=n.textureLoader;if(a.uri){const c=n.options.manager.getHandler(a.uri);c!==null&&(l=c)}return this.detectSupport().then(function(c){if(c)return n.loadTextureImage(t,o.source,l);if(i.extensionsRequired&&i.extensionsRequired.indexOf(e)>=0)throw new Error("THREE.GLTFLoader: WebP required by asset but unsupported.");return n.loadTexture(t)})}detectSupport(){return this.isSupported||(this.isSupported=new Promise(function(t){const e=new Image;e.src="data:image/webp;base64,UklGRiIAAABXRUJQVlA4IBYAAAAwAQCdASoBAAEADsD+JaQAA3AAAAAA",e.onload=e.onerror=function(){t(e.height===1)}})),this.isSupported}}class Xx{constructor(t){this.parser=t,this.name=Xt.EXT_TEXTURE_AVIF,this.isSupported=null}loadTexture(t){const e=this.name,n=this.parser,i=n.json,r=i.textures[t];if(!r.extensions||!r.extensions[e])return null;const o=r.extensions[e],a=i.images[o.source];let l=n.textureLoader;if(a.uri){const c=n.options.manager.getHandler(a.uri);c!==null&&(l=c)}return this.detectSupport().then(function(c){if(c)return n.loadTextureImage(t,o.source,l);if(i.extensionsRequired&&i.extensionsRequired.indexOf(e)>=0)throw new Error("THREE.GLTFLoader: AVIF required by asset but unsupported.");return n.loadTexture(t)})}detectSupport(){return this.isSupported||(this.isSupported=new Promise(function(t){const e=new Image;e.src="data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAABcAAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAEAAAABAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQAMAAAAABNjb2xybmNseAACAAIABoAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAAB9tZGF0EgAKCBgABogQEDQgMgkQAAAAB8dSLfI=",e.onload=e.onerror=function(){t(e.height===1)}})),this.isSupported}}class Yx{constructor(t){this.name=Xt.EXT_MESHOPT_COMPRESSION,this.parser=t}loadBufferView(t){const e=this.parser.json,n=e.bufferViews[t];if(n.extensions&&n.extensions[this.name]){const i=n.extensions[this.name],r=this.parser.getDependency("buffer",i.buffer),o=this.parser.options.meshoptDecoder;if(!o||!o.supported){if(e.extensionsRequired&&e.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return r.then(function(a){const l=i.byteOffset||0,c=i.byteLength||0,h=i.count,d=i.byteStride,u=new Uint8Array(a,l,c);return o.decodeGltfBufferAsync?o.decodeGltfBufferAsync(h,d,u,i.mode,i.filter).then(function(f){return f.buffer}):o.ready.then(function(){const f=new ArrayBuffer(h*d);return o.decodeGltfBuffer(new Uint8Array(f),h,d,u,i.mode,i.filter),f})})}else return null}}class qx{constructor(t){this.name=Xt.EXT_MESH_GPU_INSTANCING,this.parser=t}createNodeMesh(t){const e=this.parser.json,n=e.nodes[t];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;const i=e.meshes[n.mesh];for(const c of i.primitives)if(c.mode!==on.TRIANGLES&&c.mode!==on.TRIANGLE_STRIP&&c.mode!==on.TRIANGLE_FAN&&c.mode!==void 0)return null;const o=n.extensions[this.name].attributes,a=[],l={};for(const c in o)a.push(this.parser.getDependency("accessor",o[c]).then(h=>(l[c]=h,l[c])));return a.length<1?null:(a.push(this.parser.createNodeMesh(t)),Promise.all(a).then(c=>{const h=c.pop(),d=h.isGroup?h.children:[h],u=c[0].count,f=[];for(const g of d){const _=new kt,m=new L,p=new Sn,y=new L(1,1,1),M=new fv(g.geometry,g.material,u);for(let v=0;v<u;v++)l.TRANSLATION&&m.fromBufferAttribute(l.TRANSLATION,v),l.ROTATION&&p.fromBufferAttribute(l.ROTATION,v),l.SCALE&&y.fromBufferAttribute(l.SCALE,v),M.setMatrixAt(v,_.compose(m,p,y));for(const v in l)if(v==="_COLOR_0"){const I=l[v];M.instanceColor=new il(I.array,I.itemSize,I.normalized)}else v!=="TRANSLATION"&&v!=="ROTATION"&&v!=="SCALE"&&g.geometry.setAttribute(v,l[v]);ve.prototype.copy.call(M,g),this.parser.assignFinalMaterial(M),f.push(M)}return h.isGroup?(h.clear(),h.add(...f),h):f[0]}))}}const $d="glTF",Qs=12,Ph={JSON:1313821514,BIN:5130562};class $x{constructor(t){this.name=Xt.KHR_BINARY_GLTF,this.content=null,this.body=null;const e=new DataView(t,0,Qs),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(t.slice(0,4))),version:e.getUint32(4,!0),length:e.getUint32(8,!0)},this.header.magic!==$d)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");const i=this.header.length-Qs,r=new DataView(t,Qs);let o=0;for(;o<i;){const a=r.getUint32(o,!0);o+=4;const l=r.getUint32(o,!0);if(o+=4,l===Ph.JSON){const c=new Uint8Array(t,Qs+o,a);this.content=n.decode(c)}else if(l===Ph.BIN){const c=Qs+o;this.body=t.slice(c,c+a)}o+=a}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}}class Kx{constructor(t,e){if(!e)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=Xt.KHR_DRACO_MESH_COMPRESSION,this.json=t,this.dracoLoader=e,this.dracoLoader.preload()}decodePrimitive(t,e){const n=this.json,i=this.dracoLoader,r=t.extensions[this.name].bufferView,o=t.extensions[this.name].attributes,a={},l={},c={};for(const h in o){const d=cl[h]||h.toLowerCase();a[d]=o[h]}for(const h in t.attributes){const d=cl[h]||h.toLowerCase();if(o[h]!==void 0){const u=n.accessors[t.attributes[h]],f=ws[u.componentType];c[d]=f.name,l[d]=u.normalized===!0}}return e.getDependency("bufferView",r).then(function(h){return new Promise(function(d,u){i.decodeDracoFile(h,function(f){for(const g in f.attributes){const _=f.attributes[g],m=l[g];m!==void 0&&(_.normalized=m)}d(f)},a,c,Ye,u)})})}}class jx{constructor(){this.name=Xt.KHR_TEXTURE_TRANSFORM}extendTexture(t,e){return(e.texCoord===void 0||e.texCoord===t.channel)&&e.offset===void 0&&e.rotation===void 0&&e.scale===void 0||(t=t.clone(),e.texCoord!==void 0&&(t.channel=e.texCoord),e.offset!==void 0&&t.offset.fromArray(e.offset),e.rotation!==void 0&&(t.rotation=e.rotation),e.scale!==void 0&&t.repeat.fromArray(e.scale),t.needsUpdate=!0),t}}class Zx{constructor(){this.name=Xt.KHR_MESH_QUANTIZATION}}class Kd extends gr{constructor(t,e,n,i){super(t,e,n,i)}copySampleValue_(t){const e=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=t*i*3+i;for(let o=0;o!==i;o++)e[o]=n[r+o];return e}interpolate_(t,e,n,i){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=a*2,c=a*3,h=i-e,d=(n-e)/h,u=d*d,f=u*d,g=t*c,_=g-c,m=-2*f+3*u,p=f-u,y=1-m,M=p-u+d;for(let v=0;v!==a;v++){const I=o[_+v+a],T=o[_+v+l]*h,E=o[g+v+a],C=o[g+v]*h;r[v]=y*I+M*T+m*E+p*C}return r}}const Jx=new Sn;class Qx extends Kd{interpolate_(t,e,n,i){const r=super.interpolate_(t,e,n,i);return Jx.fromArray(r).normalize().toArray(r),r}}const on={POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6},ws={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},Lh={9728:Ve,9729:Qe,9984:td,9985:jr,9986:er,9987:jn},Dh={33071:Cn,33648:so,10497:ln},ha={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},cl={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},_i={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},ty={CUBICSPLINE:void 0,LINEAR:hr,STEP:cr},da={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function ey(s){return s.DefaultMaterial===void 0&&(s.DefaultMaterial=new et({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:ti})),s.DefaultMaterial}function Oi(s,t,e){for(const n in e.extensions)s[n]===void 0&&(t.userData.gltfExtensions=t.userData.gltfExtensions||{},t.userData.gltfExtensions[n]=e.extensions[n])}function $n(s,t){t.extras!==void 0&&(typeof t.extras=="object"?Object.assign(s.userData,t.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+t.extras))}function ny(s,t,e){let n=!1,i=!1,r=!1;for(let c=0,h=t.length;c<h;c++){const d=t[c];if(d.POSITION!==void 0&&(n=!0),d.NORMAL!==void 0&&(i=!0),d.COLOR_0!==void 0&&(r=!0),n&&i&&r)break}if(!n&&!i&&!r)return Promise.resolve(s);const o=[],a=[],l=[];for(let c=0,h=t.length;c<h;c++){const d=t[c];if(n){const u=d.POSITION!==void 0?e.getDependency("accessor",d.POSITION):s.attributes.position;o.push(u)}if(i){const u=d.NORMAL!==void 0?e.getDependency("accessor",d.NORMAL):s.attributes.normal;a.push(u)}if(r){const u=d.COLOR_0!==void 0?e.getDependency("accessor",d.COLOR_0):s.attributes.color;l.push(u)}}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(l)]).then(function(c){const h=c[0],d=c[1],u=c[2];return n&&(s.morphAttributes.position=h),i&&(s.morphAttributes.normal=d),r&&(s.morphAttributes.color=u),s.morphTargetsRelative=!0,s})}function iy(s,t){if(s.updateMorphTargets(),t.weights!==void 0)for(let e=0,n=t.weights.length;e<n;e++)s.morphTargetInfluences[e]=t.weights[e];if(t.extras&&Array.isArray(t.extras.targetNames)){const e=t.extras.targetNames;if(s.morphTargetInfluences.length===e.length){s.morphTargetDictionary={};for(let n=0,i=e.length;n<i;n++)s.morphTargetDictionary[e[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function sy(s){let t;const e=s.extensions&&s.extensions[Xt.KHR_DRACO_MESH_COMPRESSION];if(e?t="draco:"+e.bufferView+":"+e.indices+":"+ua(e.attributes):t=s.indices+":"+ua(s.attributes)+":"+s.mode,s.targets!==void 0)for(let n=0,i=s.targets.length;n<i;n++)t+=":"+ua(s.targets[n]);return t}function ua(s){let t="";const e=Object.keys(s).sort();for(let n=0,i=e.length;n<i;n++)t+=e[n]+":"+s[e[n]]+";";return t}function hl(s){switch(s){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function ry(s){return s.search(/\.jpe?g($|\?)/i)>0||s.search(/^data\:image\/jpeg/)===0?"image/jpeg":s.search(/\.webp($|\?)/i)>0||s.search(/^data\:image\/webp/)===0?"image/webp":s.search(/\.ktx2($|\?)/i)>0||s.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}const oy=new kt;class ay{constructor(t={},e={}){this.json=t,this.extensions={},this.plugins={},this.options=e,this.cache=new Rx,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,i=-1,r=!1,o=-1;if(typeof navigator<"u"){const a=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(a)===!0;const l=a.match(/Version\/(\d+)/);i=n&&l?parseInt(l[1],10):-1,r=a.indexOf("Firefox")>-1,o=r?a.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||n&&i<17||r&&o<98?this.textureLoader=new Od(this.options.manager):this.textureLoader=new Uv(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new Fd(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(t){this.extensions=t}setPlugins(t){this.plugins=t}parse(t,e){const n=this,i=this.json,r=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(o){return o._markDefs&&o._markDefs()}),Promise.all(this._invokeAll(function(o){return o.beforeRoot&&o.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(o){const a={scene:o[0][i.scene||0],scenes:o[0],animations:o[1],cameras:o[2],asset:i.asset,parser:n,userData:{}};return Oi(r,a,i),$n(a,i),Promise.all(n._invokeAll(function(l){return l.afterRoot&&l.afterRoot(a)})).then(function(){for(const l of a.scenes)l.updateMatrixWorld();t(a)})}).catch(e)}_markDefs(){const t=this.json.nodes||[],e=this.json.skins||[],n=this.json.meshes||[];for(let i=0,r=e.length;i<r;i++){const o=e[i].joints;for(let a=0,l=o.length;a<l;a++)t[o[a]].isBone=!0}for(let i=0,r=t.length;i<r;i++){const o=t[i];o.mesh!==void 0&&(this._addNodeRef(this.meshCache,o.mesh),o.skin!==void 0&&(n[o.mesh].isSkinnedMesh=!0)),o.camera!==void 0&&this._addNodeRef(this.cameraCache,o.camera)}}_addNodeRef(t,e){e!==void 0&&(t.refs[e]===void 0&&(t.refs[e]=t.uses[e]=0),t.refs[e]++)}_getNodeRef(t,e,n){if(t.refs[e]<=1)return n;const i=n.clone(),r=(o,a)=>{const l=this.associations.get(o);l!=null&&this.associations.set(a,l);for(const[c,h]of o.children.entries())r(h,a.children[c])};return r(n,i),i.name+="_instance_"+t.uses[e]++,i}_invokeOne(t){const e=Object.values(this.plugins);e.push(this);for(let n=0;n<e.length;n++){const i=t(e[n]);if(i)return i}return null}_invokeAll(t){const e=Object.values(this.plugins);e.unshift(this);const n=[];for(let i=0;i<e.length;i++){const r=t(e[i]);r&&n.push(r)}return n}getDependency(t,e){const n=t+":"+e;let i=this.cache.get(n);if(!i){switch(t){case"scene":i=this.loadScene(e);break;case"node":i=this._invokeOne(function(r){return r.loadNode&&r.loadNode(e)});break;case"mesh":i=this._invokeOne(function(r){return r.loadMesh&&r.loadMesh(e)});break;case"accessor":i=this.loadAccessor(e);break;case"bufferView":i=this._invokeOne(function(r){return r.loadBufferView&&r.loadBufferView(e)});break;case"buffer":i=this.loadBuffer(e);break;case"material":i=this._invokeOne(function(r){return r.loadMaterial&&r.loadMaterial(e)});break;case"texture":i=this._invokeOne(function(r){return r.loadTexture&&r.loadTexture(e)});break;case"skin":i=this.loadSkin(e);break;case"animation":i=this._invokeOne(function(r){return r.loadAnimation&&r.loadAnimation(e)});break;case"camera":i=this.loadCamera(e);break;default:if(i=this._invokeOne(function(r){return r!=this&&r.getDependency&&r.getDependency(t,e)}),!i)throw new Error("Unknown type: "+t);break}this.cache.add(n,i)}return i}getDependencies(t){let e=this.cache.get(t);if(!e){const n=this,i=this.json[t+(t==="mesh"?"es":"s")]||[];e=Promise.all(i.map(function(r,o){return n.getDependency(t,o)})),this.cache.add(t,e)}return e}loadBuffer(t){const e=this.json.buffers[t],n=this.fileLoader;if(e.type&&e.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+e.type+" buffer type is not supported.");if(e.uri===void 0&&t===0)return Promise.resolve(this.extensions[Xt.KHR_BINARY_GLTF].body);const i=this.options;return new Promise(function(r,o){n.load(or.resolveURL(e.uri,i.path),r,void 0,function(){o(new Error('THREE.GLTFLoader: Failed to load buffer "'+e.uri+'".'))})})}loadBufferView(t){const e=this.json.bufferViews[t];return this.getDependency("buffer",e.buffer).then(function(n){const i=e.byteLength||0,r=e.byteOffset||0;return n.slice(r,r+i)})}loadAccessor(t){const e=this,n=this.json,i=this.json.accessors[t];if(i.bufferView===void 0&&i.sparse===void 0){const o=ha[i.type],a=ws[i.componentType],l=i.normalized===!0,c=new a(i.count*o);return Promise.resolve(new We(c,o,l))}const r=[];return i.bufferView!==void 0?r.push(this.getDependency("bufferView",i.bufferView)):r.push(null),i.sparse!==void 0&&(r.push(this.getDependency("bufferView",i.sparse.indices.bufferView)),r.push(this.getDependency("bufferView",i.sparse.values.bufferView))),Promise.all(r).then(function(o){const a=o[0],l=ha[i.type],c=ws[i.componentType],h=c.BYTES_PER_ELEMENT,d=h*l,u=i.byteOffset||0,f=i.bufferView!==void 0?n.bufferViews[i.bufferView].byteStride:void 0,g=i.normalized===!0;let _,m;if(f&&f!==d){const p=Math.floor(u/f),y="InterleavedBuffer:"+i.bufferView+":"+i.componentType+":"+p+":"+i.count;let M=e.cache.get(y);M||(_=new c(a,p*f,i.count*f/h),M=new lv(_,f/h),e.cache.add(y,M)),m=new Rl(M,l,u%f/h,g)}else a===null?_=new c(i.count*l):_=new c(a,u,i.count*l),m=new We(_,l,g);if(i.sparse!==void 0){const p=ha.SCALAR,y=ws[i.sparse.indices.componentType],M=i.sparse.indices.byteOffset||0,v=i.sparse.values.byteOffset||0,I=new y(o[1],M,i.sparse.count*p),T=new c(o[2],v,i.sparse.count*l);a!==null&&(m=new We(m.array.slice(),m.itemSize,m.normalized)),m.normalized=!1;for(let E=0,C=I.length;E<C;E++){const S=I[E];if(m.setX(S,T[E*l]),l>=2&&m.setY(S,T[E*l+1]),l>=3&&m.setZ(S,T[E*l+2]),l>=4&&m.setW(S,T[E*l+3]),l>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}m.normalized=g}return m})}loadTexture(t){const e=this.json,n=this.options,r=e.textures[t].source,o=e.images[r];let a=this.textureLoader;if(o.uri){const l=n.manager.getHandler(o.uri);l!==null&&(a=l)}return this.loadTextureImage(t,r,a)}loadTextureImage(t,e,n){const i=this,r=this.json,o=r.textures[t],a=r.images[e],l=(a.uri||a.bufferView)+":"+o.sampler;if(this.textureCache[l])return this.textureCache[l];const c=this.loadImageSource(e,n).then(function(h){h.flipY=!1,h.name=o.name||a.name||"",h.name===""&&typeof a.uri=="string"&&a.uri.startsWith("data:image/")===!1&&(h.name=a.uri);const u=(r.samplers||{})[o.sampler]||{};return h.magFilter=Lh[u.magFilter]||Qe,h.minFilter=Lh[u.minFilter]||jn,h.wrapS=Dh[u.wrapS]||ln,h.wrapT=Dh[u.wrapT]||ln,h.generateMipmaps=!h.isCompressedTexture&&h.minFilter!==Ve&&h.minFilter!==Qe,i.associations.set(h,{textures:t}),h}).catch(function(){return null});return this.textureCache[l]=c,c}loadImageSource(t,e){const n=this,i=this.json,r=this.options;if(this.sourceCache[t]!==void 0)return this.sourceCache[t].then(d=>d.clone());const o=i.images[t],a=self.URL||self.webkitURL;let l=o.uri||"",c=!1;if(o.bufferView!==void 0)l=n.getDependency("bufferView",o.bufferView).then(function(d){c=!0;const u=new Blob([d],{type:o.mimeType});return l=a.createObjectURL(u),l});else if(o.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+t+" is missing URI and bufferView");const h=Promise.resolve(l).then(function(d){return new Promise(function(u,f){let g=u;e.isImageBitmapLoader===!0&&(g=function(_){const m=new Te(_);m.needsUpdate=!0,u(m)}),e.load(or.resolveURL(d,r.path),g,void 0,f)})}).then(function(d){return c===!0&&a.revokeObjectURL(l),$n(d,o),d.userData.mimeType=o.mimeType||ry(o.uri),d}).catch(function(d){throw console.error("THREE.GLTFLoader: Couldn't load texture",l),d});return this.sourceCache[t]=h,h}assignTexture(t,e,n,i){const r=this;return this.getDependency("texture",n.index).then(function(o){if(!o)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(o=o.clone(),o.channel=n.texCoord),r.extensions[Xt.KHR_TEXTURE_TRANSFORM]){const a=n.extensions!==void 0?n.extensions[Xt.KHR_TEXTURE_TRANSFORM]:void 0;if(a){const l=r.associations.get(o);o=r.extensions[Xt.KHR_TEXTURE_TRANSFORM].extendTexture(o,a),r.associations.set(o,l)}}return i!==void 0&&(o.colorSpace=i),t[e]=o,o})}assignFinalMaterial(t){const e=t.geometry;let n=t.material;const i=e.attributes.tangent===void 0,r=e.attributes.color!==void 0,o=e.attributes.normal===void 0;if(t.isPoints){const a="PointsMaterial:"+n.uuid;let l=this.cache.get(a);l||(l=new Dd,Rn.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,l.sizeAttenuation=!1,this.cache.add(a,l)),n=l}else if(t.isLine){const a="LineBasicMaterial:"+n.uuid;let l=this.cache.get(a);l||(l=new Ld,Rn.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,this.cache.add(a,l)),n=l}if(i||r||o){let a="ClonedMaterial:"+n.uuid+":";i&&(a+="derivative-tangents:"),r&&(a+="vertex-colors:"),o&&(a+="flat-shading:");let l=this.cache.get(a);l||(l=n.clone(),r&&(l.vertexColors=!0),o&&(l.flatShading=!0),i&&(l.normalScale&&(l.normalScale.y*=-1),l.clearcoatNormalScale&&(l.clearcoatNormalScale.y*=-1)),this.cache.add(a,l),this.associations.set(l,this.associations.get(n))),n=l}t.material=n}getMaterialType(){return et}loadMaterial(t){const e=this,n=this.json,i=this.extensions,r=n.materials[t];let o;const a={},l=r.extensions||{},c=[];if(l[Xt.KHR_MATERIALS_UNLIT]){const d=i[Xt.KHR_MATERIALS_UNLIT];o=d.getMaterialType(),c.push(d.extendParams(a,r,e))}else{const d=r.pbrMetallicRoughness||{};if(a.color=new It(1,1,1),a.opacity=1,Array.isArray(d.baseColorFactor)){const u=d.baseColorFactor;a.color.setRGB(u[0],u[1],u[2],Ye),a.opacity=u[3]}d.baseColorTexture!==void 0&&c.push(e.assignTexture(a,"map",d.baseColorTexture,be)),a.metalness=d.metallicFactor!==void 0?d.metallicFactor:1,a.roughness=d.roughnessFactor!==void 0?d.roughnessFactor:1,d.metallicRoughnessTexture!==void 0&&(c.push(e.assignTexture(a,"metalnessMap",d.metallicRoughnessTexture)),c.push(e.assignTexture(a,"roughnessMap",d.metallicRoughnessTexture))),o=this._invokeOne(function(u){return u.getMaterialType&&u.getMaterialType(t)}),c.push(Promise.all(this._invokeAll(function(u){return u.extendMaterialParams&&u.extendMaterialParams(t,a)})))}r.doubleSided===!0&&(a.side=oe);const h=r.alphaMode||da.OPAQUE;if(h===da.BLEND?(a.transparent=!0,a.depthWrite=!1):(a.transparent=!1,h===da.MASK&&(a.alphaTest=r.alphaCutoff!==void 0?r.alphaCutoff:.5)),r.normalTexture!==void 0&&o!==bt&&(c.push(e.assignTexture(a,"normalMap",r.normalTexture)),a.normalScale=new zt(1,1),r.normalTexture.scale!==void 0)){const d=r.normalTexture.scale;a.normalScale.set(d,d)}if(r.occlusionTexture!==void 0&&o!==bt&&(c.push(e.assignTexture(a,"aoMap",r.occlusionTexture)),r.occlusionTexture.strength!==void 0&&(a.aoMapIntensity=r.occlusionTexture.strength)),r.emissiveFactor!==void 0&&o!==bt){const d=r.emissiveFactor;a.emissive=new It().setRGB(d[0],d[1],d[2],Ye)}return r.emissiveTexture!==void 0&&o!==bt&&c.push(e.assignTexture(a,"emissiveMap",r.emissiveTexture,be)),Promise.all(c).then(function(){const d=new o(a);return r.name&&(d.name=r.name),$n(d,r),e.associations.set(d,{materials:t}),r.extensions&&Oi(i,d,r),d})}createUniqueName(t){const e=se.sanitizeNodeName(t||"");return e in this.nodeNamesUsed?e+"_"+ ++this.nodeNamesUsed[e]:(this.nodeNamesUsed[e]=0,e)}loadGeometries(t){const e=this,n=this.extensions,i=this.primitiveCache;function r(a){return n[Xt.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(a,e).then(function(l){return Nh(l,a,e)})}const o=[];for(let a=0,l=t.length;a<l;a++){const c=t[a],h=sy(c),d=i[h];if(d)o.push(d.promise);else{let u;c.extensions&&c.extensions[Xt.KHR_DRACO_MESH_COMPRESSION]?u=r(c):u=Nh(new qe,c,e),i[h]={primitive:c,promise:u},o.push(u)}}return Promise.all(o)}loadMesh(t){const e=this,n=this.json,i=this.extensions,r=n.meshes[t],o=r.primitives,a=[];for(let l=0,c=o.length;l<c;l++){const h=o[l].material===void 0?ey(this.cache):this.getDependency("material",o[l].material);a.push(h)}return a.push(e.loadGeometries(o)),Promise.all(a).then(function(l){const c=l.slice(0,l.length-1),h=l[l.length-1],d=[];for(let f=0,g=h.length;f<g;f++){const _=h[f],m=o[f];let p;const y=c[f];if(m.mode===on.TRIANGLES||m.mode===on.TRIANGLE_STRIP||m.mode===on.TRIANGLE_FAN||m.mode===void 0)p=r.isSkinnedMesh===!0?new hv(_,y):new R(_,y),p.isSkinnedMesh===!0&&p.normalizeSkinWeights(),m.mode===on.TRIANGLE_STRIP?p.geometry=Ih(p.geometry,ud):m.mode===on.TRIANGLE_FAN&&(p.geometry=Ih(p.geometry,tl));else if(m.mode===on.LINES)p=new pv(_,y);else if(m.mode===on.LINE_STRIP)p=new Pl(_,y);else if(m.mode===on.LINE_LOOP)p=new mv(_,y);else if(m.mode===on.POINTS)p=new gv(_,y);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+m.mode);Object.keys(p.geometry.morphAttributes).length>0&&iy(p,r),p.name=e.createUniqueName(r.name||"mesh_"+t),$n(p,r),m.extensions&&Oi(i,p,m),e.assignFinalMaterial(p),d.push(p)}for(let f=0,g=d.length;f<g;f++)e.associations.set(d[f],{meshes:t,primitives:f});if(d.length===1)return r.extensions&&Oi(i,d[0],r),d[0];const u=new Tt;r.extensions&&Oi(i,u,r),e.associations.set(u,{meshes:t});for(let f=0,g=d.length;f<g;f++)u.add(d[f]);return u})}loadCamera(t){let e;const n=this.json.cameras[t],i=n[n.type];if(!i){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?e=new Ke(qf.radToDeg(i.yfov),i.aspectRatio||1,i.znear||1,i.zfar||2e6):n.type==="orthographic"&&(e=new So(-i.xmag,i.xmag,i.ymag,-i.ymag,i.znear,i.zfar)),n.name&&(e.name=this.createUniqueName(n.name)),$n(e,n),Promise.resolve(e)}loadSkin(t){const e=this.json.skins[t],n=[];for(let i=0,r=e.joints.length;i<r;i++)n.push(this._loadNodeShallow(e.joints[i]));return e.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",e.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(i){const r=i.pop(),o=i,a=[],l=[];for(let c=0,h=o.length;c<h;c++){const d=o[c];if(d){a.push(d);const u=new kt;r!==null&&u.fromArray(r.array,c*16),l.push(u)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',e.joints[c])}return new Il(a,l)})}loadAnimation(t){const e=this.json,n=this,i=e.animations[t],r=i.name?i.name:"animation_"+t,o=[],a=[],l=[],c=[],h=[];for(let d=0,u=i.channels.length;d<u;d++){const f=i.channels[d],g=i.samplers[f.sampler],_=f.target,m=_.node,p=i.parameters!==void 0?i.parameters[g.input]:g.input,y=i.parameters!==void 0?i.parameters[g.output]:g.output;_.node!==void 0&&(o.push(this.getDependency("node",m)),a.push(this.getDependency("accessor",p)),l.push(this.getDependency("accessor",y)),c.push(g),h.push(_))}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(l),Promise.all(c),Promise.all(h)]).then(function(d){const u=d[0],f=d[1],g=d[2],_=d[3],m=d[4],p=[];for(let y=0,M=u.length;y<M;y++){const v=u[y],I=f[y],T=g[y],E=_[y],C=m[y];if(v===void 0)continue;v.updateMatrix&&v.updateMatrix();const S=n._createAnimationTracks(v,I,T,E,C);if(S)for(let x=0;x<S.length;x++)p.push(S[x])}return new rl(r,void 0,p)})}createNodeMesh(t){const e=this.json,n=this,i=e.nodes[t];return i.mesh===void 0?null:n.getDependency("mesh",i.mesh).then(function(r){const o=n._getNodeRef(n.meshCache,i.mesh,r);return i.weights!==void 0&&o.traverse(function(a){if(a.isMesh)for(let l=0,c=i.weights.length;l<c;l++)a.morphTargetInfluences[l]=i.weights[l]}),o})}loadNode(t){const e=this.json,n=this,i=e.nodes[t],r=n._loadNodeShallow(t),o=[],a=i.children||[];for(let c=0,h=a.length;c<h;c++)o.push(n.getDependency("node",a[c]));const l=i.skin===void 0?Promise.resolve(null):n.getDependency("skin",i.skin);return Promise.all([r,Promise.all(o),l]).then(function(c){const h=c[0],d=c[1],u=c[2];u!==null&&h.traverse(function(f){f.isSkinnedMesh&&f.bind(u,oy)});for(let f=0,g=d.length;f<g;f++)h.add(d[f]);return h})}_loadNodeShallow(t){const e=this.json,n=this.extensions,i=this;if(this.nodeCache[t]!==void 0)return this.nodeCache[t];const r=e.nodes[t],o=r.name?i.createUniqueName(r.name):"",a=[],l=i._invokeOne(function(c){return c.createNodeMesh&&c.createNodeMesh(t)});return l&&a.push(l),r.camera!==void 0&&a.push(i.getDependency("camera",r.camera).then(function(c){return i._getNodeRef(i.cameraCache,r.camera,c)})),i._invokeAll(function(c){return c.createNodeAttachment&&c.createNodeAttachment(t)}).forEach(function(c){a.push(c)}),this.nodeCache[t]=Promise.all(a).then(function(c){let h;if(r.isBone===!0?h=new Id:c.length>1?h=new Tt:c.length===1?h=c[0]:h=new ve,h!==c[0])for(let d=0,u=c.length;d<u;d++)h.add(c[d]);if(r.name&&(h.userData.name=r.name,h.name=o),$n(h,r),r.extensions&&Oi(n,h,r),r.matrix!==void 0){const d=new kt;d.fromArray(r.matrix),h.applyMatrix4(d)}else r.translation!==void 0&&h.position.fromArray(r.translation),r.rotation!==void 0&&h.quaternion.fromArray(r.rotation),r.scale!==void 0&&h.scale.fromArray(r.scale);return i.associations.has(h)||i.associations.set(h,{}),i.associations.get(h).nodes=t,h}),this.nodeCache[t]}loadScene(t){const e=this.extensions,n=this.json.scenes[t],i=this,r=new Tt;n.name&&(r.name=i.createUniqueName(n.name)),$n(r,n),n.extensions&&Oi(e,r,n);const o=n.nodes||[],a=[];for(let l=0,c=o.length;l<c;l++)a.push(i.getDependency("node",o[l]));return Promise.all(a).then(function(l){for(let h=0,d=l.length;h<d;h++)r.add(l[h]);const c=h=>{const d=new Map;for(const[u,f]of i.associations)(u instanceof Rn||u instanceof Te)&&d.set(u,f);return h.traverse(u=>{const f=i.associations.get(u);f!=null&&d.set(u,f)}),d};return i.associations=c(r),r})}_createAnimationTracks(t,e,n,i,r){const o=[],a=t.name?t.name:t.uuid,l=[];_i[r.path]===_i.weights?t.traverse(function(u){u.morphTargetInfluences&&l.push(u.name?u.name:u.uuid)}):l.push(a);let c;switch(_i[r.path]){case _i.weights:c=Ds;break;case _i.rotation:c=Ns;break;case _i.position:case _i.scale:c=Us;break;default:switch(n.itemSize){case 1:c=Ds;break;case 2:case 3:default:c=Us;break}break}const h=i.interpolation!==void 0?ty[i.interpolation]:hr,d=this._getArrayFromAccessor(n);for(let u=0,f=l.length;u<f;u++){const g=new c(l[u]+"."+_i[r.path],e.array,d,h);i.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(g),o.push(g)}return o}_getArrayFromAccessor(t){let e=t.array;if(t.normalized){const n=hl(e.constructor),i=new Float32Array(e.length);for(let r=0,o=e.length;r<o;r++)i[r]=e[r]*n;e=i}return e}_createCubicSplineTrackInterpolant(t){t.createInterpolant=function(n){const i=this instanceof Ns?Qx:Kd;return new i(this.times,this.values,this.getValueSize()/3,n)},t.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}}function ly(s,t,e){const n=t.attributes,i=new wn;if(n.POSITION!==void 0){const a=e.json.accessors[n.POSITION],l=a.min,c=a.max;if(l!==void 0&&c!==void 0){if(i.set(new L(l[0],l[1],l[2]),new L(c[0],c[1],c[2])),a.normalized){const h=hl(ws[a.componentType]);i.min.multiplyScalar(h),i.max.multiplyScalar(h)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;const r=t.targets;if(r!==void 0){const a=new L,l=new L;for(let c=0,h=r.length;c<h;c++){const d=r[c];if(d.POSITION!==void 0){const u=e.json.accessors[d.POSITION],f=u.min,g=u.max;if(f!==void 0&&g!==void 0){if(l.setX(Math.max(Math.abs(f[0]),Math.abs(g[0]))),l.setY(Math.max(Math.abs(f[1]),Math.abs(g[1]))),l.setZ(Math.max(Math.abs(f[2]),Math.abs(g[2]))),u.normalized){const _=hl(ws[u.componentType]);l.multiplyScalar(_)}a.max(l)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}i.expandByVector(a)}s.boundingBox=i;const o=new Dn;i.getCenter(o.center),o.radius=i.min.distanceTo(i.max)/2,s.boundingSphere=o}function Nh(s,t,e){const n=t.attributes,i=[];function r(o,a){return e.getDependency("accessor",o).then(function(l){s.setAttribute(a,l)})}for(const o in n){const a=cl[o]||o.toLowerCase();a in s.attributes||i.push(r(n[o],a))}if(t.indices!==void 0&&!s.index){const o=e.getDependency("accessor",t.indices).then(function(a){s.setIndex(a)});i.push(o)}return qt.workingColorSpace!==Ye&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${qt.workingColorSpace}" not supported.`),$n(s,t),ly(s,t,e),Promise.all(i).then(function(){return t.targets!==void 0?ny(s,t.targets,e):s})}function cy(s){const t=new Map,e=new Map,n=s.clone();return jd(s,n,function(i,r){t.set(r,i),e.set(i,r)}),n.traverse(function(i){if(!i.isSkinnedMesh)return;const r=i,o=t.get(i),a=o.skeleton.bones;r.skeleton=o.skeleton.clone(),r.bindMatrix.copy(o.bindMatrix),r.skeleton.bones=a.map(function(l){return e.get(l)}),r.bind(r.skeleton,r.bindMatrix)}),n}function jd(s,t,e){e(s,t);for(let n=0;n<s.children.length;n++)jd(s.children[n],t.children[n],e)}const hy={knight:{path:"/assets/models/Knight.glb",targetHeight:1.02},archer:{path:"/assets/models/Rogue_Hooded.glb",targetHeight:.98},mage:{path:"/assets/models/Mage.glb",targetHeight:1.05},cleric:{path:"/assets/models/Rogue.glb",targetHeight:.96,tintHex:16707722,tintStrength:.38},"melee-skeleton":{path:"/assets/models/Skeleton_Minion.glb",targetHeight:.96},"skeleton-archer":{path:"/assets/models/Skeleton_Rogue.glb",targetHeight:.96},"armored-skeleton":{path:"/assets/models/Skeleton_Warrior.glb",targetHeight:1.16},"cultist-mage":{path:"/assets/models/Skeleton_Mage.glb",targetHeight:1.02},"goblin-scout":{path:"/assets/models/Rogue.glb",targetHeight:.82,tintHex:7048739,tintStrength:.55},"goblin-stalker":{path:"/assets/models/Rogue_Hooded.glb",targetHeight:.85,tintHex:3560212,tintStrength:.58},"skeleton-shieldbearer":{path:"/assets/models/Skeleton_Warrior.glb",targetHeight:1.06,tintHex:9741240,tintStrength:.35},"necromancer-acolyte":{path:"/assets/models/Skeleton_Mage.glb",targetHeight:.98,tintHex:1096065,tintStrength:.42},"ashen-guardian":{path:"/assets/models/Skeleton_Warrior.glb",targetHeight:1.42,tintHex:8330525,tintStrength:.45}},dy=new Cx,Uh=new Map;function uy(s){let t=Uh.get(s);return t||(t=dy.loadAsync(s),Uh.set(s,t)),t}class fy{constructor(t,e,n,i){B(this,"bodyGroup");B(this,"proceduralGroup");B(this,"glbGroup",null);B(this,"mixer",null);B(this,"actions",new Map);B(this,"currentAction",null);B(this,"currentClipName","Idle");B(this,"clonedMaterials",[]);B(this,"disposed",!1);this.bodyGroup=e,this.proceduralGroup=n;const r=hy[t];uy(r.path).then(o=>{this.disposed||(this.mountGlb(o,r),i==null||i())}).catch(o=>{this.disposed||console.warn(`[CharacterVisualController] Fallback procedural para ${t}:`,o)})}get hasGlb(){return this.glbGroup!==null}getMaterials(){if(this.clonedMaterials.length>0)return this.clonedMaterials;const t=[];return this.proceduralGroup.traverse(e=>{e instanceof R&&e.material instanceof et&&t.push(e.material)}),t}playClip(t,e,n=1){if(!this.mixer)return;const i=this.actions.get(t)??(t==="Spellcast_Shoot"?this.actions.get("1H_Melee_Attack_Slice_Diagonal"):void 0)??this.actions.get("Idle");if(i){if(this.currentAction===i&&e&&this.currentClipName===t){i.timeScale=n;return}i.reset(),i.setLoop(e?dd:hd,e?1/0:1),i.clampWhenFinished=!e,i.timeScale=n,i.enabled=!0,this.currentAction&&this.currentAction!==i&&i.crossFadeFrom(this.currentAction,.08,!1),i.play(),this.currentAction=i,this.currentClipName=t}}resetToIdle(){this.playClip("Idle",!0,1)}update(t){var e;(e=this.mixer)==null||e.update(t)}dispose(){var t;this.disposed=!0,(t=this.mixer)==null||t.stopAllAction(),this.mixer=null,this.actions.clear(),this.glbGroup&&(this.bodyGroup.remove(this.glbGroup),this.glbGroup=null);for(const e of this.clonedMaterials)e.dispose();this.clonedMaterials=[]}mountGlb(t,e){const n=cy(t.scene),i=new wn().setFromObject(n),r=new L;i.getSize(r);const o=r.y>.001?e.targetHeight/r.y:1;n.scale.setScalar(o);const a=new wn().setFromObject(n),l=new L;a.getCenter(l),n.position.set(-l.x,-a.min.y,-l.z);const c=new Tt;c.add(n);const h=e.tintHex!==void 0?new It(e.tintHex):null,d=e.tintStrength??0;c.traverse(u=>{u instanceof R&&(u.castShadow=!0,u.receiveShadow=!0,Array.isArray(u.material)?u.material=u.material.map(f=>this.cloneMaterial(f,h,d)):u.material&&(u.material=this.cloneMaterial(u.material,h,d)))}),this.mixer=new $v(n);for(const u of t.animations){const f=this.mixer.clipAction(u);this.actions.set(u.name,f)}this.glbGroup=c,this.proceduralGroup.visible=!1,this.bodyGroup.add(c),this.playClip("Idle",!0,1)}cloneMaterial(t,e,n){const i=t.clone();return i instanceof et&&(e&&n>0&&i.color.lerp(e,n),this.clonedMaterials.push(i)),i}}function kh(s,t,e){const n=e?new Map(e.map((a,l)=>[a,l])):null;let i=null,r=1/0,o=1/0;for(let a=0;a<t.length;a++){const l=t[a];if(l.team!=="enemy"||!l.alive)continue;const c=Math.abs(l.pos.x-s.pos.x)+Math.abs(l.pos.y-s.pos.y),h=n?n.get(l.id)??1/0:a;(c<r||c===r&&h<o)&&(i=l,r=c,o=h)}return i}function Fh(s,t){return Math.atan2(t.x-s.x,t.z-s.z)}function py(s,t){let e=(t-s)%(Math.PI*2);return e>Math.PI&&(e-=Math.PI*2),e<-Math.PI&&(e+=Math.PI*2),e}const fa=1,pa=.75;class my{constructor(t,e,n){B(this,"scene");B(this,"board");B(this,"hpContainer");B(this,"visuals",new Map);B(this,"queue",[]);B(this,"currentAnim",null);B(this,"latestUnits",[]);B(this,"latestSelectedId",null);B(this,"latestTurnOrder",[]);B(this,"needsInitialFacing",!1);B(this,"latestCamera",null);B(this,"animClock",0);this.scene=t,this.board=e,this.hpContainer=n}get isAnimating(){return this.currentAnim!==null||this.queue.length>0}syncUnits(t,e,n,i){this.latestUnits=t,this.latestSelectedId=e,n&&(this.latestTurnOrder=n);const r=i!==void 0?i:e,o=new Set(t.map(a=>a.id));for(const[a,l]of this.visuals)o.has(a)||(l.controller.dispose(),this.disposeObjectGroup(l.root),l.hpBarEl.remove(),this.visuals.delete(a));for(const a of t){let l=this.visuals.get(a.id);if(!l)l=this.createUnitVisual(a),this.visuals.set(a.id,l),this.scene.add(l.root),this.hpContainer.appendChild(l.hpBarEl);else if(this.needsInitialFacing&&a.alive){const h=this.computeInitialYaw(a,t,this.latestTurnOrder);l.facingYaw=h,l.targetYaw=h}l.maxHp=a.maxHp,l.alive=a.alive,l.isGuarding=a.isGuarding,l.bossPhase=a.bossPhase,l.shieldAura.visible=a.alive&&a.isGuarding,l.bossEmberAura&&(l.bossEmberAura.visible=a.alive&&a.bossPhase===2),this.isPendingAttackTarget(a.id)||this.applyHpBar(l,a.hp,a.maxHp,a.isGuarding);const c=a.id===e&&a.alive;if(this.updateBaseRing(l,c),a.alive){l.deathClipPlayed=!1;const h=a.team==="enemy"||a.id===r?fa:pa;this.setUnitOpacity(l,h)}else a.team==="player"&&this.setUnitOpacity(l,pa);if(!this.isUnitInAnimation(a.id)){const h=this.board.gridToWorld(a.pos,0);l.root.position.copy(h),l.root.visible=a.alive||a.team==="player",l.bodyGroup.scale.set(1,1,1),l.weaponPivot.rotation.x=l.weaponRestRotX,a.alive?(l.bodyGroup.rotation.set(0,l.facingYaw,0),l.bodyGroup.position.set(0,0,0),l.baseRing.visible=!0,l.hpBarEl.style.display="flex"):(l.controller.hasGlb?(l.bodyGroup.rotation.set(0,l.facingYaw,0),l.bodyGroup.position.set(0,0,0),l.deathClipPlayed||(l.deathClipPlayed=!0,l.controller.playClip("Death_A",!1,1),l.controller.update(10))):(l.bodyGroup.rotation.set(Math.PI/2,l.facingYaw,0),l.bodyGroup.position.set(0,.22,0)),l.baseRing.visible=!1,l.hpBarEl.style.display="none")}}this.needsInitialFacing=!1}enqueueEvents(t){for(const e of t){if(e.type==="gameReset"){this.cleanupActiveVfx(),this.queue.length=0,this.currentAnim=null,this.needsInitialFacing=!0;for(const n of this.visuals.values())n.root.visible=!0,n.baseRing.visible=!0,n.isGuarding=!1,n.shieldAura.visible=!1,n.bossPhase=void 0,n.bossEmberAura&&(n.bossEmberAura.visible=!1),n.deathClipPlayed=!1,n.facingYaw=0,n.targetYaw=0,n.bodyGroup.rotation.set(0,0,0),n.bodyGroup.scale.set(1,1,1),n.bodyGroup.position.set(0,0,0),n.weaponPivot.rotation.x=n.weaponRestRotX,n.controller.resetToIdle(),this.setFlash(n,0),this.setUnitOpacity(n,fa);continue}if((e.type==="unitMoved"||e.type==="moveUndone")&&e.path.length>=2){const n=e.path.map(i=>this.board.gridToWorld(i,0));this.queue.push({kind:"move",unitId:e.unitId,path:n,segmentIndex:0,segmentProgress:0,stepDuration:e.type==="moveUndone"?.09:.12})}else if(e.type==="skillUsed"){const n=this.visuals.get(e.casterId);n&&this.queue.push({kind:"skillVfx",casterId:e.casterId,skillId:e.skillId,origin:n.root.position.clone(),targetPos:this.board.gridToWorld(e.targetCell,0),projectile:null,vfxGroup:null,hits:[],elapsed:0,duration:e.skillId==="arcane-burst"?.62:.32})}else if(e.type==="unitAttacked"){if(e.pendingAttackId!==void 0){const r=[...this.queue].reverse().find(o=>o.kind==="resolvePendingAttack"&&o.pendingAttackId===e.pendingAttackId);r&&r.hits.push({targetId:e.targetId,damage:e.damage,wasGuarded:e.wasGuarded??!1,targetHpRemaining:e.targetHpRemaining,hpApplied:!1});continue}if(e.skillId!==void 0){const r=[...this.queue].reverse().find(o=>o.kind==="skillVfx"&&o.skillId===e.skillId);r&&r.hits.push({targetId:e.targetId,targetHpRemaining:e.targetHpRemaining,hpApplied:!1});continue}const n=this.visuals.get(e.attackerId),i=this.visuals.get(e.targetId);if(n&&i)if(e.isRanged){const r=n.type==="mage"?12616956:e.skillId==="marked-shot"?4906624:n.team==="player"?16436245:16281969;this.queue.push({kind:"rangedAttack",attackerId:e.attackerId,targetId:e.targetId,damage:e.damage,wasGuarded:e.wasGuarded??!1,targetHpRemaining:e.targetHpRemaining,hpApplied:!1,origin:n.root.position.clone(),targetPos:i.root.position.clone(),projectile:null,color:r,elapsed:0,duration:.34})}else this.queue.push({kind:"meleeAttack",attackerId:e.attackerId,targetId:e.targetId,damage:e.damage,wasGuarded:e.wasGuarded??!1,targetHpRemaining:e.targetHpRemaining,hpApplied:!1,origin:n.root.position.clone(),targetPos:i.root.position.clone(),elapsed:0,duration:.34})}else if(e.type==="unitGuarded")this.queue.push({kind:"guard",unitId:e.unitId,vfxGroup:null,textShown:!1,elapsed:0,duration:.45});else if(e.type==="unitHealed"){const n=this.visuals.get(e.casterId);this.queue.push({kind:"heal",casterId:e.casterId,targetId:e.targetId,amount:e.amount,targetHpAfter:e.targetHpAfter,isDarkMend:(n==null?void 0:n.type)==="necromancer-acolyte",hpApplied:!1,elapsed:0,duration:.42})}else e.type==="attackPrepared"?this.queue.push({kind:"prepareAttack",casterId:e.pendingAttack.casterId,skillName:e.pendingAttack.skillName,targetCells:e.pendingAttack.targetCells.map(n=>this.board.gridToWorld(n,0)),vfxGroup:null,textShown:!1,elapsed:0,duration:.46}):e.type==="pendingAttackResolved"?this.queue.push({kind:"resolvePendingAttack",pendingAttackId:e.pendingAttackId,casterId:e.casterId,targetCells:e.targetCells.map(n=>this.board.gridToWorld(n,0)),vfxGroup:null,hits:[],elapsed:0,duration:.58}):e.type==="attackCancelled"?this.queue.push({kind:"cancelAttack",casterId:e.casterId,vfxGroup:null,elapsed:0,duration:.28}):e.type==="bossPhaseChanged"?this.queue.push({kind:"bossPhase",unitId:e.unitId,vfxGroup:null,textShown:!1,elapsed:0,duration:.65}):e.type==="unitDied"&&this.queue.push({kind:"die",unitId:e.unitId,elapsed:0,duration:.32})}}update(t,e){this.latestCamera=e,this.animClock+=t,!this.currentAnim&&this.queue.length>0&&(this.currentAnim=this.queue.shift()??null,this.initAnimation(this.currentAnim)),this.currentAnim&&this.stepAnimation(this.currentAnim,t);const n=.5+.5*Math.sin(this.animClock*4.2);for(const i of this.visuals.values()){if(i.controller.update(t),i.shieldAura.visible){const o=1+n*.08;i.shieldAura.scale.set(o,1,o);const a=i.shieldAura.material;a.opacity=.45+n*.35}if(i.bossEmberAura&&i.bossEmberAura.visible){const o=1+n*.12;i.bossEmberAura.scale.set(o,1,o);const a=i.bossEmberAura.material;a.opacity=.4+n*.35}if(i.alive&&i.bossPhase===2&&!this.isUnitInAnimation(i.id))for(const o of i.controller.getMaterials())o.emissive.setHex(10033947),o.emissiveIntensity=.18+n*.16;if(!i.alive||this.isUnitInAnimation(i.id))continue;const r=py(i.facingYaw,i.targetYaw);Math.abs(r)>.001?i.facingYaw+=r*Math.min(1,10*t):i.facingYaw=i.targetYaw,i.bodyGroup.rotation.y=i.facingYaw}this.updateHealthBarPositions(e)}initAnimation(t){if(t){if(t.kind==="move"){const e=this.visuals.get(t.unitId);e==null||e.controller.playClip("Walking_A",!0,1.4);return}if(t.kind==="die"){const e=this.visuals.get(t.unitId);e&&(e.deathClipPlayed=!0,e.controller.playClip("Death_A",!1,1.8));return}if(t.kind==="guard"){const e=this.visuals.get(t.unitId);if(e){e.controller.playClip("Block",!1,1.4);const n=new Tt;((r,o,a)=>{const l=new Ae(a*.72,a,24);l.rotateX(-Math.PI/2);const c=new bt({color:o,transparent:!0,opacity:.9,side:oe,depthWrite:!1}),h=new R(l,c);h.position.set(r.x,.1,r.z),n.add(h)})(e.root.position,3718648,.48),this.scene.add(n),t.vfxGroup=n}return}if(t.kind==="prepareAttack"){const e=this.visuals.get(t.casterId);e&&e.controller.playClip("Spellcast_Shoot",!1,1.2);const n=new Tt;for(const i of t.targetCells){const r=new Ae(.28,.44,4);r.rotateZ(Math.PI/4),r.rotateX(-Math.PI/2);const o=new bt({color:16347926,transparent:!0,opacity:.85,side:oe,depthWrite:!1}),a=new R(r,o);a.position.set(i.x,.08,i.z),n.add(a)}if(e){const i=new Ae(.4,.58,24);i.rotateX(-Math.PI/2);const r=new bt({color:15680580,transparent:!0,opacity:.9,side:oe,depthWrite:!1}),o=new R(i,r);o.position.set(e.root.position.x,.1,e.root.position.z),n.add(o)}this.scene.add(n),t.vfxGroup=n;return}if(t.kind==="resolvePendingAttack"){const e=this.visuals.get(t.casterId);e&&e.controller.playClip("1H_Melee_Attack_Slice_Diagonal",!1,1.5);const n=new Tt;for(const i of t.targetCells){const r=new Ae(.22,.46,20);r.rotateX(-Math.PI/2);const o=new bt({color:15680580,transparent:!0,opacity:.92,side:oe,depthWrite:!1}),a=new R(r,o);a.position.set(i.x,.09,i.z);const l=new Vi(.24,10,10),c=new bt({color:16347926,transparent:!0,opacity:.9}),h=new R(l,c);h.position.set(i.x,.32,i.z),n.add(a,h)}this.scene.add(n),t.vfxGroup=n;return}if(t.kind==="cancelAttack"){const e=this.visuals.get(t.casterId);if(e){const n=new Tt,i=new Ae(.26,.48,16);i.rotateX(-Math.PI/2);const r=new bt({color:9741240,transparent:!0,opacity:.75,side:oe,depthWrite:!1}),o=new R(i,r);o.position.set(e.root.position.x,.12,e.root.position.z),n.add(o),this.scene.add(n),t.vfxGroup=n}return}if(t.kind==="bossPhase"){const e=this.visuals.get(t.unitId);if(e){e.bossPhase=2,e.bossEmberAura&&(e.bossEmberAura.visible=!0),e.controller.playClip("Spellcast_Shoot",!1,1.3);const n=new Tt,i=new Ae(.35,.65,28);i.rotateX(-Math.PI/2);const r=new bt({color:16347926,transparent:!0,opacity:.95,side:oe,depthWrite:!1}),o=new R(i,r);o.position.set(e.root.position.x,.12,e.root.position.z),n.add(o),this.scene.add(n),t.vfxGroup=n}return}if(t.kind==="meleeAttack"||t.kind==="rangedAttack"){const e=this.visuals.get(t.attackerId),n=this.visuals.get(t.targetId);if(e&&n)if(t.origin.copy(e.root.position),t.targetPos.copy(n.root.position),t.kind==="meleeAttack")e.controller.playClip("1H_Melee_Attack_Slice_Diagonal",!1,1.8);else{const i=e.type==="mage"||e.type==="cultist-mage";e.controller.playClip(i?"Spellcast_Shoot":"2H_Ranged_Shoot",!1,1.8)}if(t.kind==="rangedAttack"){const i=new Vi(.11,8,8),r=new bt({color:t.color});t.projectile=new R(i,r),t.projectile.position.copy(t.origin).setY(.65),this.scene.add(t.projectile)}}else if(t.kind==="skillVfx"){const e=this.visuals.get(t.casterId);if(e){t.origin.copy(e.root.position);const n=t.skillId==="runic-strike"?"1H_Melee_Attack_Slice_Diagonal":t.skillId==="marked-shot"?"2H_Ranged_Shoot":"Spellcast_Shoot";e.controller.playClip(n,!1,1.6)}if(t.skillId==="arcane-burst"){const n=new Vi(.15,10,10),i=new bt({color:2282478});t.projectile=new R(n,i),t.projectile.position.copy(t.origin).setY(.65),this.scene.add(t.projectile)}t.vfxGroup=this.createSkillVfxGroup(t.skillId,t.targetPos),t.skillId==="arcane-burst"&&(t.vfxGroup.visible=!1),this.scene.add(t.vfxGroup)}}}createSkillVfxGroup(t,e){const n=new Tt;if(n.position.copy(e),t==="arcane-burst"){const i=new Ae(.28,.52,24);i.rotateX(-Math.PI/2);const r=new bt({color:11032055,transparent:!0,opacity:.92,side:oe,depthWrite:!1}),o=new R(i,r);o.position.y=.08;const a=new Vi(.32,12,12),l=new bt({color:2282478,transparent:!0,opacity:.9}),c=new R(a,l);c.position.y=.45,n.add(o,c);const h=new gn(.08,0);for(let d=0;d<8;d++){const u=d/8*Math.PI*2,f=new bt({color:d%2===0?2282478:12616956,transparent:!0,opacity:.95}),g=new R(h.clone(),f);g.position.set(Math.cos(u)*.25,.38,Math.sin(u)*.25),g.userData={radialDir:new L(Math.cos(u),.25,Math.sin(u))},n.add(g)}h.dispose()}else if(t==="runic-strike"){const i=new Ae(.3,.55,16);i.rotateX(-Math.PI/2);const r=new bt({color:3718648,transparent:!0,opacity:.9,side:oe,depthWrite:!1}),o=new R(i,r);o.position.y=.45,n.add(o)}else if(t==="healing-light"){const i=new Ae(.24,.46,20);i.rotateX(-Math.PI/2);const r=new bt({color:4906624,transparent:!0,opacity:.9,side:oe,depthWrite:!1}),o=new R(i,r);o.position.y=.08;const a=new Ae(.18,.34,16);a.rotateX(-Math.PI/2);const l=new bt({color:16436245,transparent:!0,opacity:.85,side:oe,depthWrite:!1}),c=new R(a,l);c.position.y=.48,n.add(o,c)}else if(t==="dark-mend"){const i=new Ae(.24,.48,20);i.rotateX(-Math.PI/2);const r=new bt({color:1096065,transparent:!0,opacity:.92,side:oe,depthWrite:!1}),o=new R(i,r);o.position.y=.08;const a=new Ae(.18,.36,16);a.rotateX(-Math.PI/2);const l=new bt({color:9647082,transparent:!0,opacity:.88,side:oe,depthWrite:!1}),c=new R(a,l);c.position.y=.46,n.add(o,c)}else{const i=new Ae(.22,.36,4);i.rotateZ(Math.PI/4),i.rotateX(-Math.PI/2);const r=new bt({color:4906624,transparent:!0,opacity:.95,side:oe,depthWrite:!1}),o=new R(i,r);o.position.y=.08,n.add(o)}return n}getUnitHitboxes(){const t=[];for(const e of this.visuals.values())e.alive&&e.root.visible&&t.push(e.hitbox);return t}stepAnimation(t,e){if(t.kind==="move"){const n=this.visuals.get(t.unitId);if(!n){this.finishCurrentAnimation();return}for(t.segmentProgress+=e/t.stepDuration;t.segmentProgress>=1&&t.segmentIndex<t.path.length-1;)t.segmentProgress-=1,t.segmentIndex++;if(t.segmentIndex>=t.path.length-1){if(n.root.position.copy(t.path[t.path.length-1]),n.bodyGroup.position.y=0,n.controller.resetToIdle(),n.team==="player"){const c=this.latestUnits.find(h=>h.id===t.unitId);if(c){const h=kh(c,this.latestUnits,this.latestTurnOrder);if(h){const d=this.board.gridToWorld(h.pos,0);n.targetYaw=Fh(n.root.position,d)}}}this.finishCurrentAnimation();return}const i=t.path[t.segmentIndex],r=t.path[t.segmentIndex+1],o=Math.min(1,t.segmentProgress);n.root.position.lerpVectors(i,r,o),n.bodyGroup.position.y=Math.sin(o*Math.PI)*.14;const a=r.x-i.x,l=r.z-i.z;if(Math.abs(a)>.001||Math.abs(l)>.001){const c=Math.atan2(a,l);n.facingYaw=c,n.targetYaw=c,n.bodyGroup.rotation.y=c}return}if(t.kind==="skillVfx"){const n=this.visuals.get(t.casterId);if(n){const a=t.targetPos.x-t.origin.x,l=t.targetPos.z-t.origin.z;if(Math.abs(a)>.001||Math.abs(l)>.001){const c=Math.atan2(a,l);n.facingYaw=c,n.targetYaw=c,n.bodyGroup.rotation.y=c}}t.elapsed+=e;const i=Math.min(1,t.elapsed/t.duration),r=t.skillId==="arcane-burst",o=r?.45:.25;if(r&&i<=o){if(t.projectile){const a=i/o;t.projectile.position.lerpVectors(t.origin,t.targetPos,a),t.projectile.position.y=.65+Math.sin(a*Math.PI)*.35-a*.2}}else{t.projectile&&(this.disposeMesh(t.projectile),t.projectile=null);const a=r?(i-o)/(1-o):i;if(t.vfxGroup){t.vfxGroup.visible=!0;const c=r?2.8:1.6;t.vfxGroup.scale.setScalar(.5+a*c),t.vfxGroup.children.forEach(h=>{var d;if(h instanceof R){const u=(d=h.userData)==null?void 0:d.radialDir;u&&h.position.set(u.x*(.25+a*.85),.38+u.y*a*.5,u.z*(.25+a*.85)),h.material instanceof bt&&(h.material.opacity=Math.max(0,1-a))}})}const l=Math.sin(Math.min(1,a*1.4)*Math.PI);for(const c of t.hits){const h=this.visuals.get(c.targetId);h&&(c.hpApplied||(c.hpApplied=!0,this.applyHpBar(h,c.targetHpRemaining,h.maxHp),h.controller.playClip("Hit_A",!1,1.8)),this.setFlash(h,l))}}if(i>=1){const a=this.visuals.get(t.casterId);a==null||a.controller.resetToIdle();for(const l of t.hits){const c=this.visuals.get(l.targetId);c&&(this.setFlash(c,0),c.alive&&c.controller.resetToIdle())}this.disposeMesh(t.projectile),t.projectile=null,this.disposeObjectGroup(t.vfxGroup),t.vfxGroup=null,this.finishCurrentAnimation()}return}if(t.kind==="meleeAttack"){const n=this.visuals.get(t.attackerId),i=this.visuals.get(t.targetId);if(!n||!i){this.finishCurrentAnimation();return}t.elapsed+=e;const r=Math.min(1,t.elapsed/t.duration),o=t.targetPos.x-t.origin.x,a=t.targetPos.z-t.origin.z,l=Math.hypot(o,a)||1,c=o/l,h=a/l;if(Math.abs(o)>.001||Math.abs(a)>.001){const f=Math.atan2(o,a);n.facingYaw=f,n.targetYaw=f,n.bodyGroup.rotation.y=f}const d=r<.45?r/.45:(1-r)/.55;n.root.position.lerpVectors(t.origin,t.targetPos,d*.42);const u=n.weaponRestRotX;r<.25?n.weaponPivot.rotation.x=u-r/.25*.65:r<.55?n.weaponPivot.rotation.x=u-.65+(r-.25)/.3*1.9:n.weaponPivot.rotation.x=u+1.25*(1-(r-.55)/.45),this.applyTargetHitReaction(t,i,r,c,h,.42),r>=1&&(n.root.position.copy(t.origin),n.weaponPivot.rotation.x=u,n.controller.resetToIdle(),i.bodyGroup.position.set(0,0,0),i.bodyGroup.rotation.x=0,i.alive&&i.controller.resetToIdle(),this.setFlash(i,0),this.finishCurrentAnimation());return}if(t.kind==="rangedAttack"){const n=this.visuals.get(t.attackerId),i=this.visuals.get(t.targetId);if(!n||!i){this.disposeMesh(t.projectile),t.projectile=null,this.finishCurrentAnimation();return}t.elapsed+=e;const r=Math.min(1,t.elapsed/t.duration),o=t.targetPos.x-t.origin.x,a=t.targetPos.z-t.origin.z,l=Math.hypot(o,a)||1,c=o/l,h=a/l;if(Math.abs(o)>.001||Math.abs(a)>.001){const d=Math.atan2(o,a);n.facingYaw=d,n.targetYaw=d,n.bodyGroup.rotation.y=d}if(t.projectile)if(r<=.6){const d=r/.6;t.projectile.position.lerpVectors(t.origin,t.targetPos,d),t.projectile.position.y=.65+Math.sin(d*Math.PI)*.35}else this.disposeMesh(t.projectile),t.projectile=null;this.applyTargetHitReaction(t,i,r,c,h,.58),r>=1&&(this.disposeMesh(t.projectile),t.projectile=null,n.controller.resetToIdle(),i.bodyGroup.position.set(0,0,0),i.bodyGroup.rotation.x=0,i.alive&&i.controller.resetToIdle(),this.setFlash(i,0),this.finishCurrentAnimation());return}if(t.kind==="heal"){const n=this.visuals.get(t.targetId);if(!n){this.finishCurrentAnimation();return}t.elapsed+=e;const i=Math.min(1,t.elapsed/t.duration);!t.hpApplied&&i>=.25&&(t.hpApplied=!0,this.applyHpBar(n,t.targetHpAfter,n.maxHp,n.isGuarding),t.amount>0&&this.spawnFloatingText(n.root.position,`+${t.amount}`,"heal"));const r=Math.sin(i*Math.PI);n.bodyGroup.position.y=r*.08;const o=t.isDarkMend?i<.5?1096065:9647082:i<.5?4906624:16436245;this.setFlash(n,r,o),i>=1&&(n.bodyGroup.position.y=0,this.setFlash(n,0),this.finishCurrentAnimation());return}if(t.kind==="guard"){const n=this.visuals.get(t.unitId);if(!n){this.disposeObjectGroup(t.vfxGroup),this.finishCurrentAnimation();return}t.elapsed+=e;const i=Math.min(1,t.elapsed/t.duration);!t.textShown&&i>=.2&&(t.textShown=!0,n.isGuarding=!0,n.shieldAura.visible=!0,this.spawnFloatingText(n.root.position,"🛡️ Defesa -50%","shield"));const r=Math.sin(i*Math.PI);if(this.setFlash(n,r*.65,3718648),t.vfxGroup){for(const o of t.vfxGroup.children)if(o instanceof R){const a=.8+i*.75;o.scale.set(a,1,a),o.material.opacity=(1-i)*.85}}i>=1&&(this.setFlash(n,0),this.disposeObjectGroup(t.vfxGroup),t.vfxGroup=null,this.finishCurrentAnimation());return}if(t.kind==="prepareAttack"){const n=this.visuals.get(t.casterId);t.elapsed+=e;const i=Math.min(1,t.elapsed/t.duration);if(!t.textShown&&i>=.15&&n&&(t.textShown=!0,this.spawnFloatingText(n.root.position,`⚠ ${t.skillName}`,"damage")),n){const r=Math.sin(i*Math.PI);this.setFlash(n,r*.65,16347926)}if(t.vfxGroup){const r=.85+Math.sin(i*Math.PI)*.25;for(const o of t.vfxGroup.children)o instanceof R&&(o.scale.set(r,1,r),o.material.opacity=(1-i*.45)*.85)}i>=1&&(n&&(this.setFlash(n,0),n.alive&&n.controller.resetToIdle()),this.disposeObjectGroup(t.vfxGroup),t.vfxGroup=null,this.finishCurrentAnimation());return}if(t.kind==="resolvePendingAttack"){const n=this.visuals.get(t.casterId);t.elapsed+=e;const i=Math.min(1,t.elapsed/t.duration);if(n){const o=Math.sin(i*Math.PI);this.setFlash(n,o*.5,15680580)}if(t.vfxGroup){for(const o of t.vfxGroup.children)if(o instanceof R){const l=o.geometry instanceof Vi?.5+i*1.6:.7+i*1.4;o.scale.setScalar(l),o.material.opacity=Math.max(0,1-i)}}const r=Math.sin(Math.min(1,i*1.4)*Math.PI);for(const o of t.hits){const a=this.visuals.get(o.targetId);a&&(!o.hpApplied&&i>=.28&&(o.hpApplied=!0,this.applyHpBar(a,o.targetHpRemaining,a.maxHp,a.isGuarding),a.controller.playClip("Hit_A",!1,1.8),this.spawnFloatingText(a.root.position,o.wasGuarded?`-${o.damage} 🛡`:`-${o.damage}`,"damage")),this.setFlash(a,r,15680580))}if(i>=1){n&&(this.setFlash(n,0),n.alive&&n.controller.resetToIdle());for(const o of t.hits){const a=this.visuals.get(o.targetId);a&&(this.setFlash(a,0),a.alive&&a.controller.resetToIdle())}this.disposeObjectGroup(t.vfxGroup),t.vfxGroup=null,this.finishCurrentAnimation()}return}if(t.kind==="cancelAttack"){t.elapsed+=e;const n=Math.min(1,t.elapsed/t.duration);if(t.vfxGroup){for(const i of t.vfxGroup.children)if(i instanceof R){const r=1+n*.5;i.scale.set(r,1,r),i.material.opacity=(1-n)*.75}}n>=1&&(this.disposeObjectGroup(t.vfxGroup),t.vfxGroup=null,this.finishCurrentAnimation());return}if(t.kind==="bossPhase"){const n=this.visuals.get(t.unitId);t.elapsed+=e;const i=Math.min(1,t.elapsed/t.duration);if(!t.textShown&&i>=.15&&n&&(t.textShown=!0,this.spawnFloatingText(n.root.position,"🔥 Fúria das Cinzas!","damage")),n){const r=Math.sin(i*Math.PI);n.bodyGroup.scale.setScalar(1+r*.14),this.setFlash(n,r*.85,16347926)}if(t.vfxGroup){for(const r of t.vfxGroup.children)if(r instanceof R){const o=.8+i*2.2;r.scale.set(o,1,o),r.material.opacity=(1-i)*.9}}i>=1&&(n&&(n.bodyGroup.scale.setScalar(1),this.setFlash(n,0),n.alive&&n.controller.resetToIdle()),this.disposeObjectGroup(t.vfxGroup),t.vfxGroup=null,this.finishCurrentAnimation());return}if(t.kind==="die"){const n=this.visuals.get(t.unitId);if(!n){this.finishCurrentAnimation();return}t.elapsed+=e;const i=Math.min(1,t.elapsed/t.duration);if(n.controller.hasGlb){if(n.team==="enemy"&&i>.65){const r=(i-.65)/.35;n.bodyGroup.scale.setScalar(Math.max(.05,1-r*.95))}}else if(n.bodyGroup.rotation.x=i*(Math.PI/2),n.team==="player")n.bodyGroup.position.y=i*.22;else{const r=Math.max(.05,1-i*.85);n.bodyGroup.scale.setScalar(r)}i>=1&&(n.root.visible=n.team==="player",n.team==="player"&&this.setUnitOpacity(n,pa),n.baseRing.visible=!1,n.hpBarEl.style.display="none",this.finishCurrentAnimation())}}applyTargetHitReaction(t,e,n,i,r,o){if(n<o)return;t.hpApplied||(t.hpApplied=!0,this.applyHpBar(e,t.targetHpRemaining,e.maxHp,e.isGuarding),t.wasGuarded?(e.controller.playClip("Block_Hit",!1,1.5),t.damage!==void 0&&t.damage>0&&this.spawnFloatingText(e.root.position,`-${t.damage} (🛡️ -50%)`,"damage")):(e.controller.playClip("Hit_A",!1,1.8),t.damage!==void 0&&t.damage>0&&this.spawnFloatingText(e.root.position,`-${t.damage}`,"damage")));const a=1-o,l=Math.min(1,(n-o)/(a*.9));if(l<1){const c=Math.sin(l*Math.PI);e.bodyGroup.position.set(i*c*.16,c*.06,r*c*.16),e.bodyGroup.rotation.x=-c*.25,this.setFlash(e,c)}else e.bodyGroup.position.set(0,0,0),e.bodyGroup.rotation.x=0,this.setFlash(e,0)}finishCurrentAnimation(){this.currentAnim=null,this.queue.length===0&&this.syncUnits(this.latestUnits,this.latestSelectedId)}cleanupActiveVfx(){var t,e,n;((t=this.currentAnim)==null?void 0:t.kind)==="rangedAttack"?this.disposeMesh(this.currentAnim.projectile):((e=this.currentAnim)==null?void 0:e.kind)==="skillVfx"?(this.disposeMesh(this.currentAnim.projectile),this.disposeObjectGroup(this.currentAnim.vfxGroup)):((n=this.currentAnim)==null?void 0:n.kind)==="guard"&&this.disposeObjectGroup(this.currentAnim.vfxGroup)}disposeMesh(t){t&&(this.scene.remove(t),t.geometry.dispose(),Array.isArray(t.material)?t.material.forEach(e=>e.dispose()):t.material.dispose())}disposeObjectGroup(t){t&&(this.scene.remove(t),t.children.forEach(e=>{e instanceof R&&(e.geometry.dispose(),Array.isArray(e.material)?e.material.forEach(n=>n.dispose()):e.material.dispose())}))}isUnitInAnimation(t){const e=n=>n?n.kind==="move"||n.kind==="die"||n.kind==="guard"||n.kind==="bossPhase"?n.unitId===t:n.kind==="skillVfx"||n.kind==="prepareAttack"||n.kind==="cancelAttack"?n.casterId===t:n.kind==="resolvePendingAttack"?n.casterId===t||n.hits.some(i=>i.targetId===t):n.kind==="heal"?n.casterId===t||n.targetId===t:n.attackerId===t||n.targetId===t:!1;return e(this.currentAnim)||this.queue.some(e)}isPendingAttackTarget(t){const e=n=>n?n.kind==="skillVfx"||n.kind==="resolvePendingAttack"?n.hits.some(i=>i.targetId===t&&!i.hpApplied):(n.kind==="meleeAttack"||n.kind==="rangedAttack"||n.kind==="heal")&&n.targetId===t&&!n.hpApplied:!1;return e(this.currentAnim)||this.queue.some(e)}applyHpBar(t,e,n,i=t.isGuarding){t.hp=e,t.isGuarding=i;const r=Math.max(0,Math.min(100,e/n*100));t.hpFillEl.style.width=`${r}%`,t.hpTextEl.textContent=`${e}/${n}`,i?(t.shieldBadgeEl.textContent="🛡 -50%",t.shieldBadgeEl.classList.remove("hidden")):(t.shieldBadgeEl.textContent="",t.shieldBadgeEl.classList.add("hidden"))}spawnFloatingText(t,e,n){if(!this.latestCamera)return;const i=t.clone();if(i.y+=1.45,i.project(this.latestCamera),i.z>1)return;const r=(i.x*.5+.5)*window.innerWidth,o=(-i.y*.5+.5)*window.innerHeight,a=document.createElement("div");a.className=`floating-combat-text floating-combat-text--${n}`,a.textContent=e,a.style.left=`${r}px`,a.style.top=`${o}px`,a.addEventListener("animationend",()=>a.remove(),{once:!0}),this.hpContainer.appendChild(a),window.setTimeout(()=>{a.isConnected&&a.remove()},1100)}setUnitOpacity(t,e){t.lastOpacity=e;const n=e<1;for(const i of t.controller.getMaterials())i.opacity=e,i.transparent=n,i.depthWrite=!n,i.needsUpdate=!0}setFlash(t,e,n=16777215){const i=e<=0&&t.alive&&t.bossPhase===2;for(const r of t.controller.getMaterials())i?(r.emissive.setHex(10033947),r.emissiveIntensity=.22):(r.emissive.setHex(e>0?n:0),r.emissiveIntensity=e*.75)}updateBaseRing(t,e){const n=t.baseRing.material;t.team==="player"?(n.color.setHex(e?16436245:3900150),n.opacity=e?.95:.65):(n.color.setHex(15680580),n.opacity=.75)}updateHealthBarPositions(t){const e=window.innerWidth,n=window.innerHeight,i=new L;for(const r of this.visuals.values()){if(!r.root.visible||!r.alive&&!this.isUnitInAnimation(r.id)){r.hpBarEl.style.display="none";continue}if(i.copy(r.root.position),i.y+=r.type==="armored-skeleton"?1.5:1.28,i.project(t),i.z>1){r.hpBarEl.style.display="none";continue}const o=(i.x*.5+.5)*e,a=(-i.y*.5+.5)*n;r.hpBarEl.style.display="flex",r.hpBarEl.style.transform=`translate(${o}px, ${a}px) translate(-50%, -100%)`}}createUnitVisual(t){const e=new Tt,n=new Tt,i=new Tt;n.add(i),e.add(n);const r=[],o=new Ae(.32,.42,4);o.rotateZ(Math.PI/4),o.rotateX(-Math.PI/2);const a=new bt({color:t.team==="player"?3900150:15680580,transparent:!0,opacity:.75,side:oe,depthWrite:!1}),l=new R(o,a);l.position.y=.024,e.add(l);const c=new Ae(.41,.49,24);c.rotateX(-Math.PI/2);const h=new bt({color:3718648,transparent:!0,opacity:.65,side:oe,depthWrite:!1}),d=new R(c,h);d.position.y=.036,d.visible=t.isGuarding,e.add(d);let u=null;if(t.type==="ashen-guardian"){const N=new Ae(.45,.56,24);N.rotateX(-Math.PI/2);const H=new bt({color:16347926,transparent:!0,opacity:.65,side:oe,depthWrite:!1});u=new R(N,H),u.position.y=.042,u.visible=t.alive&&t.bossPhase===2,e.add(u)}const f=this.buildModelByType(t.type,i,r),g=f.rotation.x,_=t.type==="ashen-guardian",m=_?new Q(.85,1.55,.85):new Q(.75,1.25,.75),p=new bt({visible:!1}),y=new R(m,p);y.position.y=_?.78:.62,y.userData={unitId:t.id},e.add(y);const M=document.createElement("div");M.className=`unit-hp-bar unit-hp-bar--${t.team}`;const v=document.createElement("div");v.className="unit-hp-track";const I=document.createElement("div");I.className="unit-hp-fill",v.appendChild(I);const T=document.createElement("span");T.className="unit-hp-text";const E=document.createElement("span");E.className="unit-shield-badge hidden",M.appendChild(v),M.appendChild(T),M.appendChild(E);const C=[],S=new Set;i.traverse(N=>{N instanceof R&&N.material instanceof et&&(S.has(N.material)||(S.add(N.material),C.push(N.material)))});let x;const P=new fy(t.type,n,i,()=>{x&&(this.setUnitOpacity(x,x.lastOpacity),!x.alive&&x.team==="player"&&(x.bodyGroup.rotation.set(0,x.facingYaw,0),x.bodyGroup.position.set(0,0,0),x.deathClipPlayed=!0,x.controller.playClip("Death_A",!1,1),x.controller.update(10)))}),F=this.computeInitialYaw(t,this.latestUnits,this.latestTurnOrder);return n.rotation.y=F,x={id:t.id,type:t.type,team:t.team,root:e,bodyGroup:n,proceduralGroup:i,controller:P,weaponPivot:f,weaponRestRotX:g,baseRing:l,shieldAura:d,bossEmberAura:u,hitbox:y,flashMaterials:r,unitMaterials:C,hpBarEl:M,hpFillEl:I,hpTextEl:T,shieldBadgeEl:E,alive:t.alive,hp:t.hp,maxHp:t.maxHp,isGuarding:t.isGuarding,bossPhase:t.bossPhase,facingYaw:F,targetYaw:F,lastOpacity:fa,deathClipPlayed:!1},x}computeInitialYaw(t,e,n){let i=null;if(t.team==="player")i=kh(t,e,n);else{const a=n?new Map(n.map((h,d)=>[h,d])):null;let l=1/0,c=1/0;for(let h=0;h<e.length;h++){const d=e[h];if(d.team!=="player"||!d.alive)continue;const u=Math.abs(d.pos.x-t.pos.x)+Math.abs(d.pos.y-t.pos.y),f=a?a.get(d.id)??1/0:h;(u<l||u===l&&f<c)&&(i=d,l=u,c=f)}}if(!i)return 0;const r=this.board.gridToWorld(t.pos,0),o=this.board.gridToWorld(i.pos,0);return Fh(r,o)}buildModelByType(t,e,n){switch(t){case"knight":return this.buildKnight(e,n);case"archer":return this.buildArcher(e,n);case"mage":return this.buildMage(e,n);case"cleric":return this.buildCleric(e,n);case"melee-skeleton":return this.buildMeleeSkeleton(e,n);case"skeleton-archer":return this.buildSkeletonArcher(e,n);case"goblin-scout":return this.buildGoblinScout(e,n);case"goblin-stalker":return this.buildGoblinStalker(e,n);case"armored-skeleton":return this.buildArmoredSkeleton(e,n);case"skeleton-shieldbearer":return this.buildSkeletonShieldbearer(e,n);case"ashen-guardian":return this.buildAshenGuardian(e,n);case"cultist-mage":return this.buildCultistMage(e,n);case"necromancer-acolyte":return this.buildNecromancerAcolyte(e,n)}}buildKnight(t,e){const n=new et({color:13358561,roughness:.4,metalness:.45}),i=new et({color:2450411,roughness:.55}),r=new et({color:16436245,roughness:.35,metalness:.6}),o=new et({color:988970,roughness:.9});e.push(n,i,r);const a=new Q(.14,.24,.16),l=new R(a,n);l.position.set(-.1,.12,0),l.castShadow=!0;const c=new R(a,n);c.position.set(.1,.12,0),c.castShadow=!0;const h=new R(new Q(.4,.38,.26),n);h.position.set(0,.43,0),h.castShadow=!0;const d=new R(new Q(.36,.38,.06),i);d.position.set(0,.4,-.15),d.castShadow=!0;const u=new R(new Q(.32,.32,.3),n);u.position.set(0,.78,0),u.castShadow=!0;const f=new R(new Q(.22,.06,.04),o);f.position.set(0,.78,.15);const g=new R(new Q(.08,.1,.24),i);g.position.set(0,.96,0);const _=new R(new Q(.08,.38,.3),i);_.position.set(-.27,.44,.06),_.castShadow=!0;const m=new R(new Q(.09,.14,.14),r);m.position.set(-.27,.44,.06);const p=new Tt;p.position.set(.27,.44,.08),p.rotation.x=Math.PI/5;const y=new R(new Q(.06,.44,.09),n);y.position.y=.24,y.castShadow=!0;const M=new R(new Q(.18,.05,.12),r);return M.position.y=.03,p.add(y,M),t.add(l,c,h,d,u,f,g,_,m,p),p}buildArcher(t,e){const n=new et({color:1483594,roughness:.65}),i=new et({color:7877903,roughness:.75}),r=new et({color:15843965,roughness:.7}),o=new et({color:9584654,roughness:.7});e.push(n,i,o);const a=new Q(.12,.24,.13),l=new R(a,i);l.position.set(-.09,.12,0),l.castShadow=!0;const c=new R(a,i);c.position.set(.09,.12,0),c.castShadow=!0;const h=new R(new Q(.32,.36,.2),n);h.position.set(0,.42,0),h.castShadow=!0;const d=new R(new Yt(.07,.06,.34,6),i);d.position.set(-.08,.48,-.14),d.rotation.z=-.25;const u=new R(new Q(.24,.24,.24),r);u.position.set(0,.73,.02);const f=new R(new Q(.3,.3,.28),n);f.position.set(0,.76,-.02),f.castShadow=!0;const g=new Tt;g.position.set(.22,.46,.14);const _=new R(new ho(.24,.03,6,12,Math.PI),o);return _.rotation.z=-Math.PI/2,_.castShadow=!0,g.add(_),t.add(l,c,h,d,u,f,g),g}buildMage(t,e){const n=new et({color:8266446,roughness:.6}),i=new et({color:16436245,roughness:.35,metalness:.55}),r=new et({color:6044187,roughness:.75}),o=new et({color:12616956,emissive:11032055,emissiveIntensity:.85,roughness:.2});e.push(n,i);const a=new R(new Yt(.18,.28,.58,8),n);a.position.set(0,.29,0),a.castShadow=!0;const l=new R(new Q(.14,.32,.3),i);l.position.set(0,.34,.02);const c=new R(new Q(.3,.3,.3),n);c.position.set(0,.74,0),c.castShadow=!0;const h=new R(new Q(.2,.2,.04),new et({color:1973067}));h.position.set(0,.73,.14);const d=new Tt;d.position.set(.24,.42,.1);const u=new R(new Yt(.03,.035,.9,6),r);u.position.y=.25,u.castShadow=!0;const f=new R(new gn(.11,0),o);return f.position.y=.75,d.add(u,f),t.add(a,l,c,h,d),d}buildMeleeSkeleton(t,e){const n=new et({color:15067115,roughness:.65}),i=new et({color:4674921,roughness:.45,metalness:.5}),r=new et({color:14427686,roughness:.6}),o=new et({color:1968393,roughness:.9});e.push(n,i,r);const a=new Q(.1,.26,.1),l=new R(a,n);l.position.set(-.09,.13,0),l.castShadow=!0;const c=new R(a,n);c.position.set(.09,.13,0),c.castShadow=!0;const h=new R(new Q(.28,.34,.18),n);h.position.set(0,.43,0),h.castShadow=!0;const d=new R(new Q(.3,.12,.2),r);d.position.set(0,.3,0);const u=new R(new Q(.16,.14,.2),i);u.position.set(-.18,.54,0),u.castShadow=!0;const f=new R(new Q(.26,.26,.26),n);f.position.set(0,.75,0),f.castShadow=!0;const g=new Q(.05,.05,.03),_=new R(g,o);_.position.set(-.06,.76,.13);const m=new R(g,o);m.position.set(.06,.76,.13);const p=new Tt;p.position.set(.22,.42,.08),p.rotation.x=Math.PI/4;const y=new R(new Q(.05,.4,.08),i);return y.position.y=.22,y.castShadow=!0,p.add(y),t.add(l,c,h,d,u,f,_,m,p),p}buildSkeletonArcher(t,e){const n=new et({color:15067115,roughness:.65}),i=new et({color:12131356,roughness:.65}),r=new et({color:7877903,roughness:.75});e.push(n,i,r);const o=new Q(.09,.26,.09),a=new R(o,n);a.position.set(-.08,.13,0),a.castShadow=!0;const l=new R(o,n);l.position.set(.08,.13,0),l.castShadow=!0;const c=new R(new Q(.26,.34,.16),n);c.position.set(0,.43,0),c.castShadow=!0;const h=new R(new Yt(.06,.05,.32,6),r);h.position.set(-.08,.48,-.12);const d=new R(new Q(.28,.28,.28),i);d.position.set(0,.75,-.01),d.castShadow=!0;const u=new R(new Q(.2,.2,.06),n);u.position.set(0,.73,.12);const f=new Tt;f.position.set(.2,.45,.12);const g=new R(new ho(.22,.028,6,12,Math.PI),r);return g.rotation.z=-Math.PI/2,g.castShadow=!0,f.add(g),t.add(a,l,c,h,d,u,f),f}buildArmoredSkeleton(t,e){const n=new et({color:3359061,roughness:.45,metalness:.55}),i=new et({color:15067115,roughness:.65}),r=new et({color:12131356,roughness:.6}),o=new et({color:16498468,roughness:.4,metalness:.3});e.push(n,i,r),t.scale.setScalar(1.18);const a=new Q(.14,.24,.15),l=new R(a,n);l.position.set(-.11,.12,0),l.castShadow=!0;const c=new R(a,n);c.position.set(.11,.12,0),c.castShadow=!0;const h=new R(new Q(.42,.4,.26),n);h.position.set(0,.44,0),h.castShadow=!0;const d=new R(new Q(.38,.42,.06),r);d.position.set(0,.42,-.16),d.castShadow=!0;const u=new R(new Q(.3,.3,.28),n);u.position.set(0,.78,0),u.castShadow=!0;const f=new Pe(.05,.2,5),g=new R(f,o);g.position.set(-.18,.9,0),g.rotation.z=.5;const _=new R(f,o);_.position.set(.18,.9,0),_.rotation.z=-.5;const m=new R(new Q(.09,.38,.3),n);m.position.set(-.28,.44,.06),m.castShadow=!0;const p=new Tt;p.position.set(.28,.44,.08),p.rotation.x=Math.PI/5;const y=new R(new Q(.06,.48,.07),n);y.position.y=.24,y.castShadow=!0;const M=new R(new Q(.04,.18,.22),i);return M.position.set(0,.42,.08),p.add(y,M),t.add(l,c,h,d,u,g,_,m,p),p}buildCleric(t,e){const n=new et({color:16317180,roughness:.7}),i=new et({color:889992,roughness:.65}),r=new et({color:16436245,roughness:.35,metalness:.6}),o=new et({color:15843965,roughness:.75});e.push(n,i,r,o);const a=new R(new Yt(.18,.28,.62,8),n);a.position.y=.31,a.castShadow=!0;const l=new R(new Q(.14,.44,.34),i);l.position.y=.4,l.castShadow=!0;const c=new R(new Q(.42,.14,.26),r);c.position.y=.6,c.castShadow=!0;const h=new R(new Q(.24,.24,.24),o);h.position.y=.78,h.castShadow=!0;const d=new R(new Yt(.15,.15,.06,8),r);d.position.y=.88;const u=new Tt;u.position.set(.27,.44,.08),u.rotation.x=Math.PI/6;const f=new R(new Yt(.03,.03,.76,6),i);f.position.y=.32,f.castShadow=!0;const g=new R(new gn(.11,0),r);return g.position.y=.74,g.castShadow=!0,u.add(f,g),t.add(a,l,c,h,d,u),u}buildGoblinScout(t,e){const n=new et({color:5078031,roughness:.8}),i=new et({color:7877903,roughness:.85}),r=new et({color:9741240,roughness:.4,metalness:.55});e.push(n,i,r);const o=new Q(.1,.22,.1),a=new R(o,n);a.position.set(-.08,.11,0);const l=new R(o,n);l.position.set(.08,.11,0);const c=new R(new Q(.28,.3,.2),i);c.position.y=.36,c.castShadow=!0;const h=new R(new Q(.22,.2,.22),n);h.position.y=.6,h.castShadow=!0;const d=new R(new Pe(.18,.24,6),i);d.position.set(0,.72,-.02),d.rotation.x=-.2;const u=new Tt;u.position.set(.2,.34,.1),u.rotation.x=Math.PI/4;const f=new R(new Q(.04,.26,.07),r);return f.position.y=.14,f.castShadow=!0,u.add(f),t.add(a,l,c,h,d,u),u}buildCultistMage(t,e){const n=new et({color:4982041,roughness:.85}),i=new et({color:8917815,roughness:.7}),r=new et({color:2696484,roughness:.9}),o=new et({color:15680580,emissive:10033947,emissiveIntensity:.55,roughness:.25});e.push(n,i,r,o);const a=new R(new Pe(.28,.68,8),n);a.position.y=.34,a.castShadow=!0;const l=new R(new Yt(.18,.24,.16,8),i);l.position.y=.58,l.castShadow=!0;const c=new R(new Pe(.19,.3,6),n);c.position.y=.79,c.castShadow=!0;const h=new Tt;h.position.set(.26,.42,.08),h.rotation.x=Math.PI/8;const d=new R(new Yt(.03,.03,.82,6),r);d.position.y=.34,d.castShadow=!0;const u=new R(new gn(.11,0),o);return u.position.y=.8,h.add(d,u),t.add(a,l,c,h),h}buildGoblinStalker(t,e){const n=new et({color:3560212,roughness:.8}),i=new et({color:2042167,roughness:.88}),r=new et({color:13358561,roughness:.35,metalness:.6});e.push(n,i,r),t.scale.setScalar(.95);const o=new Q(.1,.22,.1),a=new R(o,n);a.position.set(-.08,.11,0);const l=new R(o,n);l.position.set(.08,.11,0);const c=new R(new Q(.28,.3,.2),i);c.position.y=.36,c.castShadow=!0;const h=new R(new Q(.22,.2,.22),n);h.position.y=.6,h.castShadow=!0;const d=new R(new Pe(.19,.28,6),i);d.position.set(0,.74,-.02),d.rotation.x=-.25,d.castShadow=!0;const u=new R(new Q(.035,.24,.06),r);u.position.set(-.2,.36,.12),u.rotation.x=Math.PI/3;const f=new Tt;f.position.set(.2,.34,.1),f.rotation.x=Math.PI/4;const g=new R(new Q(.04,.3,.07),r);return g.position.y=.16,g.castShadow=!0,f.add(g),t.add(a,l,c,h,d,u,f),f}buildSkeletonShieldbearer(t,e){const n=new et({color:6583435,roughness:.45,metalness:.55}),i=new et({color:9741240,roughness:.35,metalness:.65}),r=new et({color:15067115,roughness:.65});e.push(n,i,r),t.scale.setScalar(1.06);const o=new Q(.12,.24,.13),a=new R(o,n);a.position.set(-.1,.12,0),a.castShadow=!0;const l=new R(o,n);l.position.set(.1,.12,0),l.castShadow=!0;const c=new R(new Q(.36,.38,.22),n);c.position.y=.43,c.castShadow=!0;const h=new R(new Q(.26,.26,.24),n);h.position.y=.76,h.castShadow=!0;const d=new R(new Q(.12,.54,.42),n);d.position.set(-.24,.42,.14),d.castShadow=!0;const u=new R(new Q(.14,.16,.16),i);u.position.set(-.24,.42,.14);const f=new Tt;f.position.set(.24,.42,.08),f.rotation.x=Math.PI/5;const g=new R(new Q(.05,.46,.08),i);return g.position.y=.23,g.castShadow=!0,f.add(g),t.add(a,l,c,h,d,u,f),f}buildNecromancerAcolyte(t,e){const n=new et({color:413243,roughness:.85}),i=new et({color:1096065,roughness:.6}),r=new et({color:2696484,roughness:.9}),o=new et({color:3462041,emissive:366185,emissiveIntensity:.65,roughness:.25});e.push(n,i,r,o);const a=new R(new Pe(.27,.66,8),n);a.position.y=.33,a.castShadow=!0;const l=new R(new Yt(.18,.23,.16,8),i);l.position.y=.56,l.castShadow=!0;const c=new R(new Pe(.18,.28,6),n);c.position.y=.77,c.castShadow=!0;const h=new Tt;h.position.set(.25,.42,.08),h.rotation.x=Math.PI/8;const d=new R(new Yt(.03,.03,.8,6),r);d.position.y=.33,d.castShadow=!0;const u=new R(new gn(.11,0),o);return u.position.y=.78,h.add(d,u),t.add(a,l,c,h),h}buildAshenGuardian(t,e){const n=new et({color:2565930,roughness:.45,metalness:.6}),i=new et({color:8330525,roughness:.5,metalness:.45}),r=new et({color:16347926,emissive:14427686,emissiveIntensity:.8,roughness:.3});e.push(n,i,r),t.scale.setScalar(1.4);const o=new Q(.15,.26,.16),a=new R(o,n);a.position.set(-.12,.13,0),a.castShadow=!0;const l=new R(o,n);l.position.set(.12,.13,0),l.castShadow=!0;const c=new R(new Q(.46,.44,.28),n);c.position.y=.48,c.castShadow=!0;const h=new R(new gn(.1,0),r);h.position.set(0,.5,.15);const d=new R(new Q(.18,.16,.26),i);d.position.set(-.3,.66,0),d.castShadow=!0;const u=new R(new Q(.18,.16,.26),i);u.position.set(.3,.66,0),u.castShadow=!0;const f=new R(new Q(.3,.3,.28),n);f.position.y=.84,f.castShadow=!0;const g=new R(new Pe(.16,.22,6),r);g.position.y=1.04;const _=new Tt;_.position.set(.32,.48,.1),_.rotation.x=Math.PI/5;const m=new R(new Q(.08,.68,.12),i);m.position.y=.34,m.castShadow=!0;const p=new R(new Q(.05,.52,.04),r);return p.position.set(0,.42,.07),_.add(m,p),t.add(a,l,c,h,d,u,f,g,_),_}}const gy={player:"Jogador",enemy:"Inimigos",victory:"Vitória",defeat:"Derrota"},_y={melee:"Físico",ranged:"Distância",magic:"Mágico"},Oh={str:"STR",dex:"DEX",int:"INT",fort:"FORT"},vy=["str","dex","int","fort"],xy={knight:"Cavaleiro",archer:"Arqueira",mage:"Mago",cleric:"Clérigo","melee-skeleton":"Esqueleto","skeleton-archer":"Arqueiro Esqueleto","armored-skeleton":"Esqueleto Blindado","goblin-scout":"Batedor Goblin","cultist-mage":"Mago Cultista","goblin-stalker":"Espreitador Goblin","skeleton-shieldbearer":"Escudeiro Esqueleto","necromancer-acolyte":"Acólito Necromante","ashen-guardian":"Guardião das Cinzas"},yy='<svg class="hud-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 19h14v-3l-4-2-1-6H8l1 6-4 2v3z"/><path d="M8 8V5h5v3"/></svg>',My='<svg class="hud-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/></svg>',Sy='<svg class="hud-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',wy='<svg class="hud-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 5.5 5.5v0a5.5 5.5 0 0 1-5.5 5.5H11"/></svg>',by='<svg class="hud-action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>';function Ey(s,t){const e=s.attributes[t];if(e>=Es)return"Máximo";const n=e+1;if(t==="fort"){const c=n>An?2:0,h=Math.floor(Math.max(0,e-An)/4),d=Math.floor(Math.max(0,n-An)/4),u=[];return c>0&&u.push(`+${c} HP máx`),d>h&&u.push("+1 DEF"),u.length>0?u.join(", "):`Base (${n}/${An})`}const i=Math.floor(Math.max(0,e-An)/3),r=Math.floor(Math.max(0,n-An)/3),o=ks[s.type],a=o.attackKind==="melee"&&t==="str"||o.attackKind==="ranged"&&t==="dex"||o.attackKind==="magic"&&t==="int";return r>i?s.type==="cleric"&&t==="int"?"+1 Cura/Magia":a?"+1 ATK":"+1 Bônus":`${Math.max(0,n-An)%3}/3 p/ +1`}class Ay{constructor(t,e){B(this,"healthBarsLayer");B(this,"callbacks");B(this,"heroRosterEl");B(this,"turnOrderTrackEl");B(this,"mapLabelEl");B(this,"mapNameEl");B(this,"phaseBadge");B(this,"roundValue");B(this,"timerRowEl");B(this,"timerValueEl");B(this,"countdownBannerEl");B(this,"countdownValueEl");B(this,"countdownFillEl");B(this,"enemyCountEl");B(this,"enemyListEl");B(this,"unitCardEl");B(this,"moveBtn");B(this,"attackBtn");B(this,"skillBtn");B(this,"skillIconEl");B(this,"skillLabelEl");B(this,"skillCdEl");B(this,"defendBtn");B(this,"undoMoveBtn");B(this,"endTurnBtn");B(this,"resetBtn");B(this,"menuBtn");B(this,"controlsStatusEl");B(this,"feedbackEl");B(this,"modeMenuOverlay");B(this,"btnNewCampaign");B(this,"btnContinueCampaign");B(this,"continueCampaignStageEl");B(this,"btnQuickBattle");B(this,"campOverlay");B(this,"campSubtitleEl");B(this,"campHeroesEl");B(this,"campHintEl");B(this,"btnAdvanceStage");B(this,"resultOverlay");B(this,"resultTitle");B(this,"resultSubtitle");B(this,"resultActionsEl");B(this,"feedbackTimer",null);this.callbacks=e,t.innerHTML=`
      <div id="health-bars" class="health-bars-layer"></div>

      <div class="hud-top">
        <div class="hud-left-col">
          <div class="hud-panel hud-title-card">
            <h1 class="hud-title">Rune Tactics <span class="hud-version">V4</span></h1>
            <p class="hud-subtitle">THE ASHEN CAMPAIGN</p>
          </div>

          <div class="hud-panel hud-allies-panel">
            <div class="hud-section-title">Aliados</div>
            <div id="hud-hero-roster" class="hud-hero-roster"></div>
          </div>

          <div id="hud-countdown-banner" class="hud-panel hud-countdown-banner hidden" aria-live="polite">
            <div class="hud-countdown-header">
              <span class="hud-countdown-label">⏱ Tempo do Turno</span>
              <span id="hud-countdown-value" class="hud-countdown-value">60s</span>
            </div>
            <div class="hud-countdown-track">
              <div id="hud-countdown-fill" class="hud-countdown-fill" style="width: 100%"></div>
            </div>
          </div>
        </div>

        <div class="hud-center-top">
          <div id="hud-turn-order" class="hud-panel hud-turn-order" aria-label="Ordem de turno">
            <span class="hud-turn-order-label">Ordem de Turno</span>
            <div id="hud-turn-order-track" class="hud-turn-order-track"></div>
          </div>
          <div id="hud-combat-feedback" class="hud-combat-feedback hidden"></div>
        </div>

        <div class="hud-top-right">
          <div class="hud-panel hud-turn-card">
            <div class="hud-turn-row">
              <span id="hud-map-label" class="hud-label">Mapa</span>
              <span id="hud-map-name" class="hud-map-name">—</span>
            </div>
            <div class="hud-turn-row">
              <span class="hud-label">Turno</span>
              <span id="hud-phase" class="hud-phase-badge">Jogador</span>
            </div>
            <div class="hud-turn-row">
              <span class="hud-label">Round</span>
              <span id="hud-round" class="hud-round-value">1</span>
            </div>
            <div id="hud-timer-row" class="hud-turn-row">
              <span class="hud-label">Tempo</span>
              <span id="hud-timer-value" class="hud-turn-timer-val">60s</span>
            </div>
            <div class="hud-turn-card-actions" data-interactive>
              <button id="btn-reset" class="hud-btn hud-btn-secondary hud-btn-sm" type="button">
                Reiniciar
              </button>
              <button id="btn-open-menu" class="hud-btn hud-btn-secondary hud-btn-sm" type="button" title="Voltar ao seletor de modo">
                Menu
              </button>
            </div>

            <div class="hud-divider"></div>

            <div class="hud-enemies-header">
              <span class="hud-section-title">Inimigos</span>
              <span id="hud-enemy-count" class="hud-enemy-count">0 / 0</span>
            </div>
            <div id="hud-enemy-list" class="hud-enemy-list"></div>
          </div>
        </div>
      </div>

      <div class="hud-bottom">
        <div id="hud-unit-card" class="hud-panel hud-unit-card"></div>

        <div class="hud-action-bar-wrap" data-interactive>
          <div id="hud-controls-status" class="hud-controls-status hidden">
            Vez dos inimigos
          </div>
          <div class="hud-panel hud-action-bar">
            <button id="btn-move" class="hud-action-btn hud-action-btn--move" type="button" title="Mover unidade ativa">
              ${yy}
              <span>Mover</span>
            </button>
            <button id="btn-attack" class="hud-action-btn hud-action-btn--attack" type="button" title="Ataque básico">
              ${My}
              <span>Atacar</span>
            </button>
            <button id="btn-skill" class="hud-action-btn hud-action-btn--skill" type="button">
              <img id="skill-btn-icon" src="/assets/icons/runic-strike.png" alt="" class="hud-action-icon" />
              <span id="skill-btn-label">Habilidade</span>
              <span id="skill-btn-cd" class="hud-skill-cd hidden"></span>
            </button>
            <button id="btn-defend" class="hud-action-btn hud-action-btn--defend" type="button" aria-keyshortcuts="G" title="Postura defensiva: reduz dano recebido em 50% até sua próxima ativação (G)">
              ${Sy}
              <span>Defender (G)</span>
            </button>
            <button id="btn-undo-move" class="hud-action-btn hud-action-btn--undo" type="button" title="Desfazer movimento">
              ${wy}
              <span>Desfazer movimento</span>
            </button>
            <div class="hud-action-sep" aria-hidden="true"></div>
            <button id="btn-end-turn" class="hud-action-btn hud-action-btn--end" type="button" aria-keyshortcuts="E" title="Encerrar turno (E)">
              ${by}
              <span>Encerrar turno (E)</span>
            </button>
          </div>
        </div>

        <div class="hud-bottom-spacer"></div>
      </div>

      <div class="hud-viewport-warning" role="status">
        <div class="hud-panel hud-viewport-card">
          <h2>Janela muito estreita</h2>
          <p>Rune Tactics V4 foi projetado para desktop com largura mínima de 1024 px.</p>
        </div>
      </div>

      <!-- Menu Inicial / Seletor de Modo -->
      <div id="hud-mode-menu" class="hud-overlay hidden" data-interactive>
        <div class="hud-modal hud-menu-modal">
          <div class="hud-menu-badge">V4 • THE ASHEN CAMPAIGN</div>
          <h2 class="hud-modal-title hud-menu-title">Rune Tactics</h2>
          <p class="hud-modal-subtitle">Escolha seu modo de jogo</p>
          <div class="hud-menu-actions">
            <button id="btn-new-campaign" class="hud-btn hud-btn-primary hud-btn-lg hud-menu-btn" type="button">
              <span class="hud-menu-btn-title">Nova Campanha</span>
              <span class="hud-menu-btn-desc">5 fases progressivas, evolução e chefe final</span>
            </button>
            <button id="btn-continue-campaign" class="hud-btn hud-btn-secondary hud-btn-lg hud-menu-btn" type="button">
              <span class="hud-menu-btn-title">Continuar Campanha</span>
              <span id="hud-continue-stage" class="hud-menu-btn-desc">Nenhum save encontrado</span>
            </button>
            <button id="btn-quick-battle" class="hud-btn hud-btn-secondary hud-btn-lg hud-menu-btn" type="button">
              <span class="hud-menu-btn-title">Batalha Rápida</span>
              <span class="hud-menu-btn-desc">Combate avulso com mapas sorteados</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Acampamento & Evolução entre Fases -->
      <div id="hud-camp-overlay" class="hud-overlay hidden" data-interactive>
        <div class="hud-modal hud-camp-modal">
          <div class="hud-menu-badge">ACAMPAMENTO & EVOLUÇÃO</div>
          <h2 class="hud-modal-title is-victory">Fase Concluída!</h2>
          <p id="hud-camp-subtitle" class="hud-modal-subtitle"></p>
          <div id="hud-camp-heroes" class="hud-camp-heroes"></div>
          <p id="hud-camp-hint" class="hud-camp-hint"></p>
          <div class="hud-modal-actions">
            <button id="btn-advance-stage" class="hud-btn hud-btn-primary hud-btn-lg" type="button">
              Iniciar Próxima Fase
            </button>
          </div>
        </div>
      </div>

      <!-- Resultado de Batalha / Vitória Final / Derrota -->
      <div id="hud-result-overlay" class="hud-overlay hidden" data-interactive>
        <div class="hud-modal">
          <h2 id="hud-result-title" class="hud-modal-title">Vitória!</h2>
          <p id="hud-result-subtitle" class="hud-modal-subtitle"></p>
          <div id="hud-result-actions" class="hud-modal-actions"></div>
        </div>
      </div>
    `,this.healthBarsLayer=t.querySelector("#health-bars"),this.heroRosterEl=t.querySelector("#hud-hero-roster"),this.turnOrderTrackEl=t.querySelector("#hud-turn-order-track"),this.mapLabelEl=t.querySelector("#hud-map-label"),this.mapNameEl=t.querySelector("#hud-map-name"),this.phaseBadge=t.querySelector("#hud-phase"),this.roundValue=t.querySelector("#hud-round"),this.timerRowEl=t.querySelector("#hud-timer-row"),this.timerValueEl=t.querySelector("#hud-timer-value"),this.countdownBannerEl=t.querySelector("#hud-countdown-banner"),this.countdownValueEl=t.querySelector("#hud-countdown-value"),this.countdownFillEl=t.querySelector("#hud-countdown-fill"),this.enemyCountEl=t.querySelector("#hud-enemy-count"),this.enemyListEl=t.querySelector("#hud-enemy-list"),this.unitCardEl=t.querySelector("#hud-unit-card"),this.moveBtn=t.querySelector("#btn-move"),this.attackBtn=t.querySelector("#btn-attack"),this.skillBtn=t.querySelector("#btn-skill"),this.skillIconEl=t.querySelector("#skill-btn-icon"),this.skillLabelEl=t.querySelector("#skill-btn-label"),this.skillCdEl=t.querySelector("#skill-btn-cd"),this.defendBtn=t.querySelector("#btn-defend"),this.undoMoveBtn=t.querySelector("#btn-undo-move"),this.endTurnBtn=t.querySelector("#btn-end-turn"),this.resetBtn=t.querySelector("#btn-reset"),this.menuBtn=t.querySelector("#btn-open-menu"),this.controlsStatusEl=t.querySelector("#hud-controls-status"),this.feedbackEl=t.querySelector("#hud-combat-feedback"),this.modeMenuOverlay=t.querySelector("#hud-mode-menu"),this.btnNewCampaign=t.querySelector("#btn-new-campaign"),this.btnContinueCampaign=t.querySelector("#btn-continue-campaign"),this.continueCampaignStageEl=t.querySelector("#hud-continue-stage"),this.btnQuickBattle=t.querySelector("#btn-quick-battle"),this.campOverlay=t.querySelector("#hud-camp-overlay"),this.campSubtitleEl=t.querySelector("#hud-camp-subtitle"),this.campHeroesEl=t.querySelector("#hud-camp-heroes"),this.campHintEl=t.querySelector("#hud-camp-hint"),this.btnAdvanceStage=t.querySelector("#btn-advance-stage"),this.resultOverlay=t.querySelector("#hud-result-overlay"),this.resultTitle=t.querySelector("#hud-result-title"),this.resultSubtitle=t.querySelector("#hud-result-subtitle"),this.resultActionsEl=t.querySelector("#hud-result-actions"),this.moveBtn.addEventListener("click",()=>this.callbacks.onSetMode("default")),this.attackBtn.addEventListener("click",()=>this.callbacks.onSetMode("attack")),this.skillBtn.addEventListener("click",()=>this.callbacks.onSetMode("skill")),this.defendBtn.addEventListener("click",()=>this.callbacks.onDefend()),this.undoMoveBtn.addEventListener("click",()=>this.callbacks.onUndoMove()),this.endTurnBtn.addEventListener("click",()=>this.callbacks.onEndTurn()),this.resetBtn.addEventListener("click",()=>this.callbacks.onReset()),this.menuBtn.addEventListener("click",()=>this.callbacks.onOpenMenu()),this.btnNewCampaign.addEventListener("click",()=>this.callbacks.onNewCampaign()),this.btnContinueCampaign.addEventListener("click",()=>this.callbacks.onContinueCampaign()),this.btnQuickBattle.addEventListener("click",()=>this.callbacks.onQuickBattle()),this.btnAdvanceStage.addEventListener("click",()=>this.callbacks.onAdvanceStage())}showModeMenu(t){if(this.campOverlay.classList.add("hidden"),this.resultOverlay.classList.add("hidden"),this.modeMenuOverlay.classList.remove("hidden"),t){this.btnContinueCampaign.disabled=!1;const e=Si.find(r=>r.stageNumber===t.currentStage),n=e?` — ${e.name}`:"",i=t.status==="between_stages"?" (Acampamento)":t.status==="completed"?" (Concluída)":"";this.continueCampaignStageEl.textContent=`Fase ${t.currentStage}/5${n}${i}`}else this.btnContinueCampaign.disabled=!0,this.continueCampaignStageEl.textContent="Nenhum save encontrado"}hideModeMenu(){this.modeMenuOverlay.classList.add("hidden")}showCampOverlay(t,e){this.modeMenuOverlay.classList.add("hidden"),this.resultOverlay.classList.add("hidden"),this.campOverlay.classList.remove("hidden");const n=Si.find(a=>a.stageNumber===t.currentStage),i=Si.find(a=>a.stageNumber===t.currentStage+1),r=n?`Fase ${n.stageNumber}/5 (${n.name})`:`Fase ${t.currentStage}/5`,o=i?`Fase ${i.stageNumber}/5 — ${i.name}`:`Fase ${t.currentStage+1}/5`;this.campSubtitleEl.textContent=`${r} concluída → Próxima: ${o}`,this.campHeroesEl.innerHTML="";for(const a of t.heroes){const l=ks[a.type],c=document.createElement("div");c.className=`hud-camp-hero hud-class--${a.type}`;const h=Math.max(0,Math.min(100,a.hp/a.maxHp*100)),d=vy.map(f=>{const g=a.attributes[f],_=a.unspentPoints<=0||g>=Es,m=Ey(a,f);return`
          <div class="hud-camp-attr-row">
            <div class="hud-camp-attr-info">
              <span class="hud-camp-attr-name">${Oh[f]}</span>
              <strong class="hud-camp-attr-val">${g}</strong>
              <span class="hud-camp-attr-preview">${m}</span>
            </div>
            <button
              class="hud-camp-plus-btn"
              type="button"
              data-hero-id="${a.id}"
              data-attr="${f}"
              ${_?"disabled":""}
              title="Aumentar ${Oh[f]}"
            >+</button>
          </div>
        `}).join("");c.innerHTML=`
        <div class="hud-camp-hero-header">
          <img src="${l.portraitPath??""}" alt="${l.name}" class="hud-camp-portrait" />
          <div class="hud-camp-hero-meta">
            <div class="hud-camp-hero-title-row">
              <strong class="hud-camp-hero-name">${l.name}</strong>
              <span class="hud-camp-points ${a.unspentPoints>0?"has-points":""}">
                ${a.unspentPoints} pt${a.unspentPoints===1?"":"s"}
              </span>
            </div>
            <div class="hud-camp-hp-row">
              <div class="hud-mini-track">
                <div class="hud-mini-fill" style="width:${h}%"></div>
              </div>
              <span class="hud-camp-hp-val">${a.hp}/${a.maxHp} HP</span>
            </div>
          </div>
        </div>
        <div class="hud-camp-attrs">${d}</div>
      `,c.querySelectorAll(".hud-camp-plus-btn").forEach(f=>{f.addEventListener("click",()=>{const g=f.dataset.heroId,_=f.dataset.attr;g&&_&&this.callbacks.onAllocateAttribute(g,_)})}),this.campHeroesEl.appendChild(c)}this.btnAdvanceStage.textContent=`Iniciar Fase ${t.currentStage+1}`,this.btnAdvanceStage.disabled=!e,this.campHintEl.textContent=e?"Todos os pontos foram distribuídos. Pronto para avançar!":"Distribua os pontos disponíveis de cada herói antes de iniciar a próxima fase."}hideCampOverlay(){this.campOverlay.classList.add("hidden")}showCampaignCompletedOverlay(){this.modeMenuOverlay.classList.add("hidden"),this.campOverlay.classList.add("hidden"),this.resultOverlay.classList.remove("hidden"),this.resultTitle.textContent="Campanha Concluída!",this.resultTitle.className="hud-modal-title is-victory",this.resultSubtitle.textContent="The Ashen Campaign — O Guardião das Cinzas foi derrotado e o santuário purificado.",this.renderResultButtons([{label:"Nova campanha",primary:!0,onClick:()=>this.callbacks.onNewCampaign()},{label:"Menu",primary:!1,onClick:()=>this.callbacks.onOpenMenu()}])}hideOverlays(){this.modeMenuOverlay.classList.add("hidden"),this.campOverlay.classList.add("hidden"),this.resultOverlay.classList.add("hidden")}renderResultButtons(t){this.resultActionsEl.innerHTML="";for(const e of t){const n=document.createElement("button");n.type="button",n.className=`hud-btn ${e.primary?"hud-btn-primary":"hud-btn-secondary"} hud-btn-lg`,n.textContent=e.label,n.addEventListener("click",e.onClick),this.resultActionsEl.appendChild(n)}}updateTurnTimer(t){if(t===null){this.timerRowEl.classList.add("hidden"),this.countdownBannerEl.classList.add("hidden");return}this.timerRowEl.classList.remove("hidden"),this.countdownBannerEl.classList.remove("hidden");const e=Math.max(0,Math.ceil(t)),n=Math.max(0,Math.min(100,e/60*100)),i=e<=15&&e>5,r=e<=5;this.timerValueEl.textContent=`${e}s`,this.timerValueEl.classList.toggle("is-warning",i),this.timerValueEl.classList.toggle("is-critical",r),this.countdownValueEl.textContent=`${e}s`,this.countdownFillEl.style.width=`${n}%`,this.countdownBannerEl.classList.toggle("is-warning",i),this.countdownBannerEl.classList.toggle("is-critical",r)}showFeedback(t){this.feedbackTimer!==null&&window.clearTimeout(this.feedbackTimer),this.feedbackEl.textContent=t,this.feedbackEl.classList.remove("hidden"),this.feedbackTimer=window.setTimeout(()=>{this.feedbackEl.classList.add("hidden"),this.feedbackTimer=null},2e3)}update(t,e,n,i){const r=t.turnState==="player_unit_active",o=t.turnState==="enemy_activation",a=!r||n;t.mode==="campaign"&&t.stageNumber!==void 0&&t.stageName?(this.mapLabelEl.textContent="Fase",this.mapNameEl.textContent=`Fase ${t.stageNumber}/5 — ${t.stageName}`):(this.mapLabelEl.textContent="Mapa",this.mapNameEl.textContent=t.mapName),this.phaseBadge.textContent=gy[t.phase],this.phaseBadge.className=`hud-phase-badge hud-phase--${t.phase}`,this.roundValue.textContent=String(t.round),this.controlsStatusEl.classList.toggle("hidden",!o),this.controlsStatusEl.textContent=o?"Vez dos inimigos":n?"Executando ação...":"",this.renderTurnOrder(t);const l=_=>_.alive?_.id===t.activeUnitId?{label:"EM TURNO",cls:"is-in-turn"}:_.hasActivatedThisRound?{label:"CONCLUÍDO",cls:"is-done"}:{label:"AGUARDANDO",cls:"is-waiting"}:{label:"DERROTADO",cls:"is-defeated"},c=t.units.filter(_=>_.team==="player");this.heroRosterEl.innerHTML="";for(const _ of c){const m=document.createElement("div"),p=_.id===t.activeUnitId,{label:y,cls:M}=l(_);m.className=`hud-hero-item hud-class--${_.type}${p?" is-active-unit":""}${_.hasActivatedThisRound?" is-activated":""}${_.alive?"":" is-dead"}`;const v=Math.max(0,Math.min(100,_.hp/_.maxHp*100)),I=_.alive&&v<35,T=_.hasMoved?"is-used":"is-ready",E=_.hasAttacked?"is-used":"is-ready";m.innerHTML=`
        <img src="${_.portraitPath??""}" alt="${_.name}" class="hud-hero-portrait" />
        <div class="hud-hero-info">
          <div class="hud-hero-top">
            <span class="hud-hero-name">${_.name}</span>
            <span class="hud-hero-hp">${_.hp}/${_.maxHp}</span>
          </div>
          <div class="hud-hero-hp-row">
            <div class="hud-mini-track">
              <div class="hud-mini-fill${I?" is-low":""}" style="width:${v}%"></div>
            </div>
          </div>
          <div class="hud-hero-bottom">
            <span class="hud-hero-status ${M}">${y}</span>
            <span class="hud-hero-pips">
              <i class="pip ${T}" title="Movimento"></i>
              <i class="pip ${E}" title="Ataque"></i>
            </span>
          </div>
        </div>
      `,this.heroRosterEl.appendChild(m)}const h=t.units.filter(_=>_.team==="enemy"),d=h.filter(_=>_.alive).length;this.enemyCountEl.textContent=`${d} / ${h.length}`,this.enemyListEl.innerHTML="";for(const _ of h){const m=document.createElement("div"),p=_.id===t.activeUnitId,{label:y,cls:M}=l(_);m.className=`hud-enemy-item${p?" is-active-unit":""}${_.alive?"":" is-dead"}`,m.innerHTML=`
        <img src="${_.portraitPath??""}" alt="${_.name}" class="hud-enemy-portrait" />
        <div class="hud-enemy-info">
          <div class="hud-enemy-top">
            <span class="hud-enemy-name">${_.name}</span>
            <span class="hud-enemy-hp">${_.hp}/${_.maxHp}</span>
          </div>
          <div class="hud-enemy-bottom">
            <span class="hud-enemy-status ${M}">${y}</span>
          </div>
        </div>
      `,this.enemyListEl.appendChild(m)}const u=t.phase==="victory"||t.phase==="defeat",f=u?null:t.activeUnitId??t.selectedUnitId,g=f?t.units.find(_=>_.id===f&&_.alive)??null:null;if(this.renderUnitCard(g,t.activeUnitId),this.updateActionBar(r?g:null,e,a,i,t.canUndoMove,n,o),u&&!n){const _=t.phase==="victory";t.mode==="campaign"?_||(this.resultOverlay.classList.remove("hidden"),this.resultTitle.textContent="Derrota!",this.resultTitle.className="hud-modal-title is-defeat",this.resultSubtitle.textContent=`Todos os heróis caíram na Fase ${t.stageNumber??1}/5 (round ${t.round}).`,this.renderResultButtons([{label:"Reiniciar fase (Checkpoint)",primary:!0,onClick:()=>this.callbacks.onRestartStageCheckpoint()},{label:"Nova campanha",primary:!1,onClick:()=>this.callbacks.onNewCampaign()},{label:"Menu",primary:!1,onClick:()=>this.callbacks.onOpenMenu()}])):(this.resultOverlay.classList.remove("hidden"),this.resultTitle.textContent=_?"Vitória!":"Derrota!",this.resultTitle.className=`hud-modal-title ${_?"is-victory":"is-defeat"}`,this.resultSubtitle.textContent=_?`Todos os inimigos foram derrotados em ${t.round} round(s).`:`Todos os heróis caíram no round ${t.round}.`,this.renderResultButtons([{label:"Jogar novamente",primary:!0,onClick:()=>this.callbacks.onReset()},{label:"Menu",primary:!1,onClick:()=>this.callbacks.onOpenMenu()}]))}else u||this.resultOverlay.classList.add("hidden")}renderTurnOrder(t){if(this.turnOrderTrackEl.innerHTML="",t.turnOrder.length===0)return;const e=new Map(t.units.map(l=>[l.id,l])),n=t.turnOrder.length,i=8,r=Math.max(0,t.turnIndex%n);let o=0,a=!1;for(let l=0;l<n*2&&o<i;l++){const c=r+l;if(c>=n&&!a){a=!0;const g=document.createElement("div");g.className="hud-turn-sep",g.textContent=`R${t.round+1}`,g.title=`Round ${t.round+1}`,this.turnOrderTrackEl.appendChild(g)}const h=t.turnOrder[c%n],d=e.get(h);if(!d||!d.alive)continue;const u=l===0&&d.id===t.activeUnitId,f=document.createElement("div");f.className=`hud-turn-item hud-turn-item--${d.team}${u?" is-current":""}`,f.title=`${d.name} (${d.hp}/${d.maxHp} HP)`,f.innerHTML=`
        ${u?'<span class="hud-turn-caret" aria-hidden="true">▼</span>':""}
        <img src="${d.portraitPath??""}" alt="${d.name}" class="hud-turn-portrait" />
      `,this.turnOrderTrackEl.appendChild(f),o++}}updateActionBar(t,e,n,i,r,o,a){const l=a?"Vez dos inimigos":o?"Aguarde a animação":"Ação indisponível",c=!n&&!!t&&!t.hasActivatedThisRound;if(this.moveBtn.disabled=!c||t.hasMoved,this.moveBtn.classList.toggle("is-selected",e==="default"&&!this.moveBtn.disabled),this.moveBtn.title=this.moveBtn.disabled?t!=null&&t.hasMoved?"Já se moveu":l:"Mover unidade ativa",this.attackBtn.disabled=!c||t.hasAttacked,this.attackBtn.classList.toggle("is-selected",e==="attack"),this.attackBtn.title=this.attackBtn.disabled?t!=null&&t.hasAttacked?"Já atacou":l:"Ataque básico (ou clique em um inimigo para ataque inteligente)",t&&t.skillId){const h=ur[t.skillId],d=h.targetTeam==="ally";this.skillBtn.style.display="flex",this.skillIconEl.src=h.icon??"/assets/icons/runic-strike.png",this.skillLabelEl.textContent=h.name;const u=h.heal>0?`Cura: ${h.heal}`:`Dano: ${h.damage}`,f=h.area==="cross"?"Cruz (5 células)":"Alvo único";this.skillBtn.classList.toggle("is-heal-skill",d),t.skillCooldown>0?(this.skillCdEl.textContent=String(t.skillCooldown),this.skillCdEl.classList.remove("hidden")):this.skillCdEl.classList.add("hidden");const g=c&&!t.hasAttacked&&t.skillCooldown===0&&i;if(this.skillBtn.disabled=!g,this.skillBtn.classList.toggle("is-selected",e==="skill"),g)this.skillBtn.title=`${h.name} — ${u} | Alcance: ${h.range} | Área: ${f} | Recarga: ${h.cooldown}t`;else{const _=n?l:t.hasAttacked?"Já atacou nesta ativação":t.skillCooldown>0?`Em recarga: ${t.skillCooldown} rodada(s)`:"Nenhum alvo válido";this.skillBtn.title=`${h.name} — ${_}`}}else this.skillBtn.disabled=!0,this.skillBtn.classList.remove("is-selected","is-heal-skill"),this.skillLabelEl.textContent="Habilidade",this.skillCdEl.classList.add("hidden"),this.skillBtn.title=l;this.defendBtn.disabled=!c||t.hasAttacked,this.defendBtn.title=this.defendBtn.disabled?t!=null&&t.hasAttacked?"Já agiu nesta ativação":l:"Postura defensiva: reduz dano recebido em 50% até sua próxima ativação (G)",this.undoMoveBtn.disabled=!r||o,this.undoMoveBtn.title=this.undoMoveBtn.disabled?"Nenhum movimento para desfazer":"Desfazer último movimento desta ativação",this.endTurnBtn.disabled=!c,this.endTurnBtn.title=this.endTurnBtn.disabled?l:"Encerrar turno (E)"}renderUnitCard(t,e){if(this.unitCardEl.classList.remove("is-enemy-active"),!t){this.unitCardEl.innerHTML=`
        <div class="hud-unit-empty">
          <strong>Batalha encerrada</strong>
          <span>Use as opções da tela de resultado para continuar.</span>
        </div>
      `;return}const n=t.team==="enemy";this.unitCardEl.classList.toggle("is-enemy-active",n),this.unitCardEl.classList.toggle("is-locked",n);const i=Math.max(0,Math.min(100,t.hp/t.maxHp*100)),r=!n&&i<35,o=xy[t.type]??t.type,a=_y[t.attackKind]??t.attackKind,l=[t.isGuarding?'<span class="hud-unit-badge hud-unit-badge--guard">🛡 Postura Defensiva (-50%)</span>':"",t.bossPhase===2?'<span class="hud-unit-badge hud-unit-badge--boss">🔥 Fase 2: Fúria das Cinzas</span>':""].filter(Boolean).join(""),c=t.skillName?`
        <div class="hud-unit-skill-row">
          <span class="hud-unit-skill">${t.skillName}</span>
          <span class="hud-unit-skill-cd">${t.skillCooldown>0?`Recarga: ${t.skillCooldown}t`:"Pronta"}</span>
        </div>
      `:"",h=!n&&t.id===e?`
        <div class="hud-unit-actions">
          <span class="action-pill ${t.hasMoved?"is-used":"is-ready"}">
            <i class="pill-dot"></i>Movimento: ${t.hasMoved?"Usado":"Disponível"}
          </span>
          <span class="action-pill ${t.hasAttacked?"is-used":"is-ready"}">
            <i class="pill-dot"></i>Ataque: ${t.hasAttacked?"Usado":"Disponível"}
          </span>
        </div>
      `:"";this.unitCardEl.innerHTML=`
      <div class="hud-unit-card-inner hud-class--${t.type}">
        <img src="${t.portraitPath??""}" alt="${t.name}" class="hud-unit-portrait hud-unit-portrait--${t.team}" />
        <div class="hud-unit-body">
          <div class="hud-unit-header">
            <span class="hud-unit-name">${t.name}</span>
            <span class="hud-unit-class">${o}</span>
          </div>
          <div class="hud-unit-hp-row">
            <div class="hud-mini-track">
              <div class="hud-mini-fill${r?" is-low":""}${n?" is-enemy":""}" style="width:${i}%"></div>
            </div>
            <span class="hud-unit-hp-val">${t.hp} / ${t.maxHp}</span>
          </div>
          <div class="hud-unit-stats">
            <div><span>ATK (${a})</span><strong>${t.damage}</strong></div>
            <div><span>DEF</span><strong>${t.armor}</strong></div>
            <div><span>MOV</span><strong>${t.moveRange}</strong></div>
            <div><span>ALC</span><strong>${t.attackRange}</strong></div>
          </div>
          <div class="hud-unit-attrs">
            <span>STR <strong>${t.attributes.str}</strong></span>
            <span>DEX <strong>${t.attributes.dex}</strong></span>
            <span>INT <strong>${t.attributes.int}</strong></span>
            <span>FORT <strong>${t.attributes.fort}</strong></span>
          </div>
          ${l?`<div class="hud-unit-badges">${l}</div>`:""}
          ${c}
          ${h}
        </div>
      </div>
    `}}const Fl=document.getElementById("game-canvas"),Zd=document.getElementById("hud");if(!Fl||!Zd)throw new Error("Elementos #game-canvas ou #hud não encontrados no DOM.");const Ol=new wu(window.localStorage),Ge=new vu(Ol);let Et=new $h;const Ty={getState:()=>Et.getState(),selectUnit:s=>Et.selectUnit(s),getReachableCells:s=>Et.getReachableCells(s),getPath:(s,t)=>Et.getPath(s,t),getAttackableTargets:s=>Et.getAttackableTargets(s),hasLineOfSight:(s,t)=>Et.hasLineOfSight(s,t),getAttackRangeCells:s=>Et.getAttackRangeCells(s),getSkillRangeCells:s=>Et.getSkillRangeCells(s),getSkillTargetCells:s=>Et.getSkillTargetCells(s),getSkillAreaCells:(s,t)=>Et.getSkillAreaCells(s,t),moveSelectedUnit:s=>Et.moveSelectedUnit(s),attackTarget:s=>Et.attackTarget(s),useSkill:s=>Et.useSkill(s),undoMove:()=>Et.undoMove(),getSmartAttackPlan:s=>Et.getSmartAttackPlan(s),smartAttack:s=>Et.smartAttack(s),getSmartSkillPlan:s=>Et.getSmartSkillPlan(s),smartUseSkill:s=>Et.smartUseSkill(s),defend:()=>Et.defend(),endPlayerTurn:()=>Et.endPlayerTurn(),executeNextEnemyAction:()=>Et.executeNextEnemyAction(),reset:()=>Et.reset(),consumeEvents:()=>Et.consumeEvents()},Ci=new Tx(Fl),Jn=new Sx(Ci.scene),bo=60,Cy={backgroundColor:791588,fogColor:791588,fogDensity:.012,ambientColor:9741240,ambientIntensity:.48,hemiSkyColor:9356776,hemiGroundColor:1979702,hemiIntensity:.62,dirColor:16773590,dirIntensity:1.38,dirPosition:[11,18,8],rimColor:8246268,rimIntensity:.55,rimPosition:[-10,10,-11],pointLights:[{position:[-6.65,1.75,-6.65],color:16096779,intensity:3.2,distance:14,decay:1.5},{position:[6.65,1.75,-6.65],color:16096779,intensity:3.2,distance:14,decay:1.5},{position:[-6.65,1.75,6.65],color:16096779,intensity:3.2,distance:14,decay:1.5},{position:[6.65,1.75,6.65],color:16096779,intensity:3.2,distance:14,decay:1.5}]};let Fe="default",ar=null,Bl=null,Hl=[],Yi=0,Bh=!1,dl=Et.getState().phase,Ei=bo,po=null,mo=0,go=null,In=!0,_o=!1;function Gl(s){const t=Gh.find(e=>e.id===s.mapId);Jn.buildBoard(s.gridSize,s.obstacleDefs,t?{mapId:t.id,theme:t.theme,bridgeCells:t.bridgeCells}:s.mapId),Ci.applyAtmosphere(Jn.getAtmosphere()??Cy)}function Ry(s){const t=new Set,e=[];for(const n of s.pendingAttacks)for(const i of n.targetCells){const r=`${i.x},${i.y}`;t.has(r)||(t.add(r),e.push(i))}return e}function bs(s){Et=new $h(s);const t=Et.getState();Gl(t),Fe="default",Ri(),Yi=0,Ei=bo,po=null,mo=0,go=null,dl=t.phase,_o=!1,In=!1,he.hideOverlays(),ni()}function Iy(){bs({mode:"quick-battle"})}function Py(){Ge.startNewCampaign(),bs(Ge.createStageGameSetup())}function Ly(){const s=Ge.loadCampaign();if(!s){he.showModeMenu(null);return}if(s.status==="between_stages"){In=!0,he.showCampOverlay(s,Ge.canAdvanceToNextStage());return}if(s.status==="completed"){In=!0,he.showCampaignCompletedOverlay();return}bs(Ge.createStageGameSetup())}function Jd(){if(In||tn.isAnimating||Et.getState().turnState!=="player_unit_active")return;Et.endPlayerTurn().ok&&(Fe="default",Ri(),Yi=.25,ni())}function Qd(){if(In||tn.isAnimating||Et.getState().turnState!=="player_unit_active")return;Et.defend().ok&&(Fe="default",Ri(),ni())}const he=new Ay(Zd,{onSelectUnit:s=>{},onSetMode:s=>{if(In||tn.isAnimating||Et.getState().phase!=="player")return;Fe=Fe===s&&s!=="default"?"default":s,Ri(),Eo();const t=Et.getState(),e=t.selectedUnitId?Et.getSkillTargetCells().length>0:!1;he.update(t,Fe,tn.isAnimating,e)},onDefend:Qd,onUndoMove:()=>{if(In||tn.isAnimating||Et.getState().turnState!=="player_unit_active")return;Et.undoMove().ok&&(Fe="default",Ri(),ni())},onEndTurn:Jd,onReset:()=>{if(Et.getState().mode==="campaign"){Ge.restartCurrentStage(),bs(Ge.createStageGameSetup());return}Et.reset();const t=Et.getState();Gl(t),Fe="default",Ri(),Yi=0,Ei=bo,po=null,mo=0,go=null,_o=!1,he.hideOverlays(),ni()},onNewCampaign:Py,onContinueCampaign:Ly,onQuickBattle:Iy,onOpenMenu:()=>{In=!0,he.showModeMenu(Ol.load())},onAllocateAttribute:(s,t)=>{const e=Ge.allocateHeroAttribute(s,t);e.ok?he.showCampOverlay(e.state,Ge.canAdvanceToNextStage()):he.showFeedback(e.reason)},onAdvanceStage:()=>{const s=Ge.advanceToNextStage();if(!s.ok){he.showFeedback(s.reason);return}bs(Ge.createStageGameSetup())},onRestartStageCheckpoint:()=>{Ge.restartCurrentStage(),bs(Ge.createStageGameSetup())}});window.addEventListener("wheel",s=>{(s.ctrlKey||s.metaKey)&&s.preventDefault()},{passive:!1});window.addEventListener("keydown",s=>{var e;if((s.ctrlKey||s.metaKey)&&(s.key==="+"||s.key==="-"||s.key==="="||s.key==="0")){s.preventDefault();return}if(s.repeat)return;const t=(e=s.target)==null?void 0:e.tagName;t==="INPUT"||t==="TEXTAREA"||t==="SELECT"||(s.key==="e"||s.key==="E"?Jd():(s.key==="g"||s.key==="G")&&Qd())});const tn=new my(Ci.scene,Jn,he.healthBarsLayer);function Ri(){ar=null,Bl=null,Hl=[]}function Eo(){const s=Et.getState(),t=Ry(s);if(s.phase!=="player"||tn.isAnimating||!s.selectedUnitId){Jn.setHighlights({reachable:[],attackable:[],skillTargets:[],skillArea:[],dangerCells:t,hoverCell:null,path:null});return}if(Fe==="skill"){const e=s.units.find(i=>i.id===s.selectedUnitId),n=e!=null&&e.skillId?ur[e.skillId].targetTeam:"enemy";Jn.setHighlights({reachable:[],attackable:[],skillRangeCells:Et.getSkillRangeCells(),skillTargets:Et.getSkillTargetCells(),skillArea:Hl,skillMode:n,dangerCells:t,hoverCell:ar,path:null});return}if(Fe==="attack"){Jn.setHighlights({reachable:[],attackRangeCells:Et.getAttackRangeCells(),attackable:Et.getAttackableTargets().map(e=>e.pos),skillTargets:[],skillArea:[],dangerCells:t,hoverCell:ar,path:null});return}Jn.setHighlights({reachable:Et.getReachableCells(),attackable:Et.getAttackableTargets().map(e=>e.pos),skillTargets:[],skillArea:[],dangerCells:t,hoverCell:ar,path:Bl})}function Dy(s){const t=Et.getState().units;for(const e of s)if(e.type==="skillUsed"){const n=t.find(i=>i.id===e.casterId);n&&he.showFeedback(`${n.name} usou ${n.skillName??e.skillId}!`)}else if(e.type==="unitHealed"){const n=t.find(r=>r.id===e.casterId),i=t.find(r=>r.id===e.targetId);n&&i&&he.showFeedback(`${n.name} curou ${i.name} (+${e.amount} HP)!`)}else if(e.type==="unitGuarded"){const n=t.find(i=>i.id===e.unitId);n&&he.showFeedback(`${n.name} assumiu postura defensiva (-50% dano)!`)}else if(e.type==="attackPrepared"){const n=t.find(i=>i.id===e.pendingAttack.casterId);he.showFeedback(`${(n==null?void 0:n.name)??"Inimigo"} está preparando ${e.pendingAttack.skillName}!`)}else if(e.type==="pendingAttackResolved"){const n=t.find(i=>i.id===e.casterId);he.showFeedback(`${(n==null?void 0:n.name)??"Inimigo"} desencadeou ${e.skillName}!`)}else if(e.type==="attackCancelled"){const n=t.find(i=>i.id===e.casterId);he.showFeedback(`Ataque anunciado de ${(n==null?void 0:n.name)??"inimigo"} foi cancelado!`)}else if(e.type==="bossPhaseChanged"){const n=t.find(i=>i.id===e.unitId);he.showFeedback(`🔥 ${(n==null?void 0:n.name)??"Guardião das Cinzas"} entrou na Fase 2: Fúria das Cinzas!`)}else if(e.type==="unitAttacked"&&!e.skillId){const n=t.find(r=>r.id===e.attackerId),i=t.find(r=>r.id===e.targetId);if(n&&i){const r=e.wasGuarded?" (🛡 -50%)":"";he.showFeedback(`${n.name} causou ${e.damage} de dano em ${i.name}${r}!`)}}}function tu(s){if(s.mode!=="campaign"||s.phase!=="victory"||tn.isAnimating||_o)return;_o=!0,In=!0;const t=Ge.completeStage(s);t.status==="completed"?he.showCampaignCompletedOverlay():he.showCampOverlay(t,Ge.canAdvanceToNextStage())}function Ny(s){if(s.turnState==="player_unit_active"){const t=s.activeUnitId!==po,e=s.round!==mo;(t||e||go!=="player_unit_active")&&(Ei=bo,po=s.activeUnitId,mo=s.round),he.updateTurnTimer(Math.ceil(Ei))}else he.updateTurnTimer(null);go=s.turnState}function ni(){const s=Et.consumeEvents();s.length>0&&(tn.enqueueEvents(s),Dy(s));const t=Et.getState();dl!=="enemy"&&t.phase==="enemy"&&(Yi=.25,Fe="default"),dl=t.phase,tn.syncUnits(t.units,t.selectedUnitId,t.turnOrder,t.activeUnitId),Eo();const e=t.selectedUnitId?Et.getSkillTargetCells().length>0:!1;he.update(t,Fe,tn.isAnimating,e),Ny(t),tu(t)}new Zv(Fl,Ci.camera,Ty,Jn,tn,{getMode:()=>Fe,setMode:s=>{Fe=s},onHoverChange:(s,t,e)=>{ar=s,Bl=t,Hl=e,Eo()},onActionExecuted:()=>{Ri(),ni()},onFeedback:s=>{he.showFeedback(s)}},Ci.cameraController);const Uy=Et.getState();Gl(Uy);ni();he.showModeMenu(Ol.load());Ci.start(s=>{Jn.update(s,Ci.cameraController.currentAzimuth),tn.update(s,Ci.camera);const t=tn.isAnimating;if(Bh&&!t){const n=Et.getState(),i=n.selectedUnitId?Et.getSkillTargetCells().length>0:!1;Eo(),he.update(n,Fe,!1,i),tu(n)}if(Bh=t,In)return;const e=Et.getState();if(e.turnState==="player_unit_active"){if(Ei=Math.max(0,Ei-s),he.updateTurnTimer(Math.ceil(Ei)),Ei<=0&&!t){Et.endPlayerTurn().ok&&(Fe="default",Ri(),ni());return}}else if(e.turnState==="enemy_activation"&&!t&&(Yi-=s,Yi<=0)){const n=Et.executeNextEnemyAction();ni(),Yi=n?.24:.05}});
