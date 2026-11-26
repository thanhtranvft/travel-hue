"""Prepare reviewable boat-music excerpts from the user-supplied local recording.

Selects acoustic candidates, not a verified lyrical chorus. Never edits the source.
"""
from pathlib import Path
import json
import numpy as np
import soundfile as sf
from scipy.signal import resample_poly, stft, find_peaks

root = Path(__file__).resolve().parents[2]
source = root / 'Music' / 'Hò Đối Đáp Trên Sông Hương.mp3'
output = root / '3.CunCon' / 'src' / 'assets' / 'music'
report_dir = root / '3.CunCon' / 'tool' / 'river-music-review'
report_dir.mkdir(parents=True, exist_ok=True)
audio, sr = sf.read(source, always_2d=True, dtype='float32')
mono = resample_poly(audio.mean(axis=1), 1, 4)
rate = sr // 4
hop = 3000
_, times, spec = stft(mono, fs=rate, nperseg=4096, noverlap=4096-hop)
power = abs(spec)**2
freq = np.fft.rfftfreq(4096, 1/rate)
valid = (freq>=110)&(freq<=3000)
notes = np.round(69+12*np.log2(freq[valid]/440)).astype(int)%12
chroma = np.stack([power[valid][notes==i].sum(axis=0) for i in range(12)])
chroma = np.log1p(chroma*10000)
chroma -= chroma.mean(axis=0)
chroma /= np.maximum(np.linalg.norm(chroma,axis=0),1e-9)
duration = len(audio)/sr
# Repeating 18-second phrases, independent of lyrics or assumed song structure.
matches=[]
for start in np.arange(6,duration-25,2):
    a=int(start*rate/hop); n=int(18*rate/hop)
    for other in np.arange(start+38,duration-20,2):
        b=int(other*rate/hop)
        similarity=float(np.mean(np.sum(chroma[:,a:a+n]*chroma[:,b:b+n],axis=0)))
        matches.append((similarity,float(start),float(other)))
matches.sort(reverse=True)
# Use section-level energy rather than isolated loud syllables.
energy=[]
for start in np.arange(5,duration-36,2):
    chunk=mono[int(start*rate):int((start+32)*rate)]
    energy.append((float(np.mean(chunk**2)),float(start)))
energy.sort(reverse=True)
chosen=[]
for energy_value,start in energy:
    if all(abs(start-prev[1])>=40 for prev in chosen):
        chosen.append((energy_value,start))
    if len(chosen)==3:break
# Snap boundaries to quiet 100ms windows near the intended phrase edges.
def quiet_boundary(target, window=2):
    candidates=np.arange(max(0,target-window),min(duration-.15,target+window),.05)
    return float(min(candidates,key=lambda t:np.mean(mono[int(t*rate):int((t+.1)*rate)]**2)))

selected=[]
for _,start in sorted(chosen,key=lambda p:p[1]):
    begin=quiet_boundary(start)
    end=quiet_boundary(start+34)
    selected.append({'start':round(begin,2),'end':round(end,2),'selection':'sustained acoustic energy; lyrical climax unverified'})
# Add one distinct recurring phrase if the strongest pair is outside the chosen clips.
for score,a,b in matches:
    candidates=[t for t in [a,b] if all(t+22<s['start'] or t>s['end']+2 for s in selected)]
    if score>=.25 and candidates:
        begin=quiet_boundary(candidates[0]);end=quiet_boundary(candidates[0]+22)
        selected.append({'start':round(begin,2),'end':round(end,2),'selection':'repeating chroma phrase; not a verified lyrical chorus','similar_phrase_start':b if candidates[0]==a else a,'similarity':round(score,3)})
        break
selected.sort(key=lambda s:s['start'])
report={'source':str(source),'source_duration_seconds':round(duration,3),'sample_rate':sr,'channels':audio.shape[1],
        'method':'Acoustic energy and chroma repetition; no direct listening or lyrical chorus verification.',
        'top_repeating_phrases':matches[:8],'proposed_clips':selected}
(report_dir/'analysis.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(report,ensure_ascii=True))

if __name__=='__main__':
    import sys
    if '--export' not in sys.argv:raise SystemExit(0)
    output.mkdir(parents=True,exist_ok=True)
    records=[]
    for index,selection in enumerate(selected,1):
        begin,end=selection['start'],selection['end']
        clip=audio[round(begin*sr):round(end*sr)].copy()
        # Consistent conservative peak headroom across every excerpt; no hard limiting.
        gain=min(1.,.84/float(np.max(np.abs(audio))))
        clip*=gain
        fade_in=min(int(sr*.6),len(clip)//4);fade_out=min(int(sr*1.2),len(clip)//4)
        clip[:fade_in]*=np.linspace(0,1,fade_in)[:,None]
        clip[-fade_out:]*=np.linspace(1,0,fade_out)[:,None]
        name=f'ho-doi-dap-song-huong-{index:02d}.mp3'
        destination=output/name
        if destination.exists():raise FileExistsError(f'Refusing to overwrite {destination}')
        sf.write(destination,clip,sr,format='MP3',subtype='MPEG_LAYER_III')
        decoded,decoded_sr=sf.read(destination,always_2d=True,dtype='float32')
        if abs(len(decoded)/decoded_sr-(end-begin))>.15:raise RuntimeError('Incorrect output duration')
        if not np.isfinite(decoded).all() or np.max(np.abs(decoded))>=1:raise RuntimeError('Output clipping/invalid samples')
        records.append({**selection,'id':f'ho-doi-dap-{index:02d}','file':name,'duration_seconds':round(len(decoded)/decoded_sr,3),'bytes':destination.stat().st_size,'peak_dbfs':round(float(20*np.log10(np.max(np.abs(decoded)))),2),'fade_in_seconds':.6,'fade_out_seconds':1.2,'review_status':'acoustic_candidate_needs_listening'})
    manifest={'source':source.name,'source_duration_seconds':round(duration,3),'notes':'Trích đoạn gợi ý theo năng lượng/cấu trúc lặp, chưa xác nhận cao trào hoặc điệp khúc bằng nghe/lời. Không có reverb cố định; xử lý không gian khi phát trong game. Chưa nối vào gameplay.', 'clips':records}
    (output/'ho-doi-dap-song-huong.clips.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
    print(json.dumps({'exported':records},ensure_ascii=True))
