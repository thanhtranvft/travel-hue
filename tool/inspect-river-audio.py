from pathlib import Path
import importlib.util, json
root=Path(__file__).resolve().parents[2]
print(json.dumps({'files':[{'path':str(p),'bytes':p.stat().st_size} for p in (root/'Music').glob('*.mp3')], 'modules':{m: bool(importlib.util.find_spec(m)) for m in ['numpy','scipy','soundfile','librosa','imageio_ffmpeg','pydub','av']}},ensure_ascii=True))
import soundfile as sf
import numpy as np
p=next((root/'Music').glob('*.mp3'))
y,sr=sf.read(p,always_2d=True,dtype='float32')
print(json.dumps({'sample_rate':sr,'channels':y.shape[1],'duration':len(y)/sr,'peak':float(np.max(np.abs(y))),'mp3_output_supported':'MP3' in sf.available_formats()}))
mono=y.mean(axis=1)
values=[]
for t in range(0,int(len(y)/sr),4):
    chunk=mono[t*sr:(t+4)*sr]
    values.append([t,round(float(20*np.log10(np.sqrt(np.mean(chunk**2))+1e-9)),1)])
print(json.dumps({'four_second_rms_db':values}))
