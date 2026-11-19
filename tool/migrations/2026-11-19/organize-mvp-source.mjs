import {readdir,readFile,writeFile,rename,mkdir,stat} from 'node:fs/promises';
import path from 'node:path';import {fileURLToPath} from 'node:url';
const root=path.resolve(fileURLToPath(new URL('../',import.meta.url))),moves=new Map(),dirs=[
 ['src/audio','src/core/audio'],['src/traffic','src/core/traffic'],['src/vehicle','src/core/vehicle'],['src/world','src/core/world'],['src/geography','src/core/shared/geography'],['src/landmarks','src/core/shared/architecture'],['src/routes','src/legacy/routes'],['src/assets/sound','src/assets/audio/collisions']
];
const overrides={
 'src/core/CityGame.js':'src/app/GamePresenter.js','src/core/Game.js':'src/legacy/core/Game.js','src/core/ScenicGame.js':'src/legacy/core/ScenicGame.js',
 'src/core/InputController.js':'src/core/input/InputController.js','src/core/TouchControls.js':'src/core/input/TouchControls.js','src/core/touchMath.js':'src/core/input/touchMath.js','src/core/keyboardInput.js':'src/core/input/keyboardInput.js',
 'src/core/renderQuality.js':'src/core/rendering/renderQuality.js','src/core/sceneResources.js':'src/core/shared/resources/sceneResources.js',
 'src/vehicle/DogBike.js':'src/legacy/vehicle/DogBike.js','src/world/HueWorld.js':'src/legacy/world/HueWorld.js','src/world/DetailedWorld.js':'src/legacy/world/DetailedWorld.js','src/world/StreetLife.js':'src/legacy/world/StreetLife.js',
 'src/world/MobileStaticScene.js':'src/core/rendering/MobileStaticScene.js','src/world/MobileCrowd.js':'src/core/rendering/MobileCrowd.js','src/world/MobileTrees.js':'src/core/rendering/MobileTrees.js',
 'src/world/CITParking.js':'src/modules/areas/quoc-hoc/view/CITParking.js','src/world/BoardwalkRails.js':'src/modules/areas/south-bank/view/BoardwalkRails.js',
 'src/geography/regionalMap.js':'src/modules/areas/AreaModel.js','src/geography/AreaView.js':'src/modules/areas/AreaView.js','src/geography/AreaPresenter.js':'src/modules/areas/AreaPresenter.js',
 'src/landmarks/SchoolGates.js':'src/modules/areas/quoc-hoc/view/SchoolGates.js','src/landmarks/YouthPlayground.js':'src/modules/areas/quoc-hoc/view/YouthPlayground.js',
 'src/landmarks/quoc-hoc/index.js':'src/modules/areas/quoc-hoc/view/BiaQuocHoc.js','src/landmarks/truong-tien/index.js':'src/modules/areas/truong-tien/view/TruongTien.js',
 'src/landmarks/ky-dai/index.js':'src/modules/areas/imperial-city/view/KyDai.js','src/landmarks/ngo-mon/index.js':'src/modules/areas/imperial-city/view/NgoMon.js',
 'src/data/school-gates.json':'src/modules/areas/quoc-hoc/data/school-gates.json','src/data/youth-playground.json':'src/modules/areas/quoc-hoc/data/youth-playground.json',
 'src/data/buildingCatalog.js':'src/core/shared/data/buildingCatalog.js','src/data/buildings.json':'src/data/world/buildings.json','src/data/sites.json':'src/data/world/sites.json','src/data/property-enclosures.json':'src/data/world/property-enclosures.json','src/data/pedestrians.json':'src/data/world/pedestrians.json',
 'src/data/collision-dialogue.json':'src/data/audio/collision-dialogue.json','src/data/collision-recordings.json':'src/data/audio/collision-recordings.json',
 'src/audio/huethuong.mp3':'src/assets/audio/music/huethuong.mp3','src/audio/Thuong Ve Mien Trung.mp3':'src/assets/audio/music/Thuong Ve Mien Trung.mp3',
 'src/assets/hue-geography.json':'src/assets/maps/source/hue-geography.json','src/geography/osm-snapshot.json':'src/assets/maps/source/osm-snapshot.json','src/geography/osm-entrances.json':'src/assets/maps/source/osm-entrances.json',
 'src/geography/regions/manifest.json':'tool/fixtures/regions-manifest.generated.json'
};
for(const id of ['quoc-hoc','south-bank','truong-tien','north-bank','imperial-city'])overrides[`src/geography/regions/${id}.json`]=`src/modules/areas/${id}/model/osm.json`;
async function walk(dir){const result=[];for(const entry of await readdir(dir,{withFileTypes:true})){const name=path.join(dir,entry.name);if(entry.isDirectory())result.push(...await walk(name));else result.push(name);}return result;}
const sourceFiles=await walk(path.join(root,'src')),textFiles=[...sourceFiles,...await walk(path.join(root,'test')),...await walk(path.join(root,'tests')),...await walk(path.join(root,'tool')),path.join(root,'vite.config.js')].filter(p=>p.endsWith('.js')||p.endsWith('.mjs'));
const known=new Set([...sourceFiles,...textFiles].map(p=>path.resolve(p)));const knownDirs=new Set();for(const file of known){let dir=path.dirname(file);while(dir.startsWith(root)&&dir!==root){knownDirs.add(dir);dir=path.dirname(dir);}}
function target(relative){if(overrides[relative])return overrides[relative];for(const [from,to]of dirs)if(relative.startsWith(from+'/'))return to+relative.slice(from.length);return relative;}
for(const file of sourceFiles){const relative=path.relative(root,file).replaceAll('\\','/'),to=path.resolve(root,target(relative));if(file!==to)moves.set(path.resolve(file),to);}
function safe(p){if(!p.startsWith(root+path.sep))throw new Error(`Outside workspace: ${p}`);}
for(const [from,to]of moves){safe(from);safe(to);try{await stat(to);throw new Error(`Target already exists: ${to}`);}catch(error){if(error.code!=='ENOENT')throw error;}}
const updates=[];
for(const file of textFiles){const destination=moves.get(path.resolve(file))||file;let text=await readFile(file,'utf8');text=text.replace(/(['"])(\.{1,2}\/[^'"\n]+|\/src\/[^'"\n]+)\1/g,(whole,quote,specifier)=>{const absolute=specifier.startsWith('/src/')?path.resolve(root,specifier.slice(1)):path.resolve(path.dirname(file),specifier);if(!known.has(absolute)&&!knownDirs.has(absolute))return whole;let resolved=moves.get(absolute);if(!resolved&&knownDirs.has(absolute)){const rel=path.relative(root,absolute).replaceAll('\\','/');resolved=path.resolve(root,target(rel+'/')).replace(/[\\/]$/,'');}resolved||=absolute;const next=specifier.startsWith('/src/')?'/'+path.relative(root,resolved).replaceAll('\\','/'):path.relative(path.dirname(destination),resolved).replaceAll('\\','/');return quote+(next.startsWith('.')||next.startsWith('/')?next:'./'+next)+(specifier.endsWith('/')&&!next.endsWith('/')?'/':'')+quote;});updates.push([destination,text]);}
for(const [from,to]of moves){await mkdir(path.dirname(to),{recursive:true});await rename(from,to);}
for(const [file,text]of updates)await writeFile(file,text);
for(const id of ['quoc-hoc','south-bank','truong-tien','north-bank','imperial-city']){const directory=path.join(root,'src/modules/areas',id);await writeFile(path.join(directory,'index.js'),`export const id=${JSON.stringify(id)};\nexport const loadModel=()=>import('./model/osm.json');\n`);}
console.log(JSON.stringify({moved:moves.size,rewritten:updates.length,root}));
