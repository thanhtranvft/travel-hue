import { createServer } from 'vite';
import { spawn } from 'node:child_process';
import { createGameServer } from '../../server/index.js';
const backend=await createGameServer();
await new Promise(resolve=>backend.server.listen(0,'127.0.0.1',resolve));
const frontend=await createServer({server:{host:'127.0.0.1',port:5181,strictPort:true,proxy:{'/online':{target:`http://127.0.0.1:${backend.server.address().port}`,ws:true}}}});
try {
  await frontend.listen();
  const script=new URL(process.argv[2] || './inspect-online-presence.mjs',import.meta.url);
  const child=spawn(process.execPath,[script.pathname.replace(/^\/([A-Za-z]:)/,'$1'),'http://127.0.0.1:5181/'],{stdio:'inherit'});
  process.exitCode=await new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',code=>resolve(code??1));});
}finally{await frontend.close();await backend.close();}
