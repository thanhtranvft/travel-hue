import {defineConfig} from 'vite';
export default defineConfig({
  build:{rollupOptions:{output:{manualChunks:id=>id.includes('osm-snapshot.json')?'hue-osm-data':undefined}}},
  server:{
    host:'0.0.0.0',
    port:3000,
    allowedHosts:true,
    watch:{ignored:['**/tool/**','**/dist/**']}
  },
});
