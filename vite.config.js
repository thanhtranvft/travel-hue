import {defineConfig} from 'vite';
import {fileURLToPath} from 'node:url';
export default defineConfig({
  resolve:{alias:[{find:/^.*\/geography\/map\.js$/,replacement:fileURLToPath(new URL('./src/modules/areas/AreaModel.js',import.meta.url)).replaceAll('\\','/')}]},
  build:{rollupOptions:{output:{manualChunks:id=>id.includes('osm-snapshot.json')?'hue-osm-data':undefined}}},
  server:{
    host:'0.0.0.0',
    port:3000,
    allowedHosts:true,
    watch:{ignored:['**/tool/**','**/dist/**']}
  },
});
