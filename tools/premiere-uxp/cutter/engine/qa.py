import json,re,statistics as st
d=json.load(open('cutlist.json'))
times,levels=[],[]; t=None
for line in open('rms.txt'):
    m=re.match(r"frame:\d+\s+pts:\d+\s+pts_time:([\d.]+)",line)
    if m: t=float(m.group(1)); continue
    m=re.match(r"lavfi\.astats\.Overall\.RMS_level=(-?[\d.]+|-inf)",line)
    if m and t is not None:
        times.append(t); levels.append(-120.0 if m.group(1)=='-inf' else float(m.group(1))); t=None
def rms_at(x):
    lo,hi=0,len(times)-1
    while lo<hi:
        mid=(lo+hi)//2
        if times[mid]<x: lo=mid+1
        else: hi=mid
    return levels[lo]
b=[x for s,e in d['keeps'] for x in (s,e)]
v=[rms_at(x) for x in b]
bad=[(x,y) for x,y in zip(b,v) if y>-26.0]
print(f"{len(b)} boundaries | median {st.median(v):.1f} dB | worst {max(v):.1f} dB")
print(f"above -26 dB: {len(bad)}  ({len(bad)/len(b)*100:.1f}%)")
for x,y in sorted(bad,key=lambda z:-z[1])[:6]:
    print(f"   {int(x//60):02d}:{x%60:06.3f}  {y:6.1f} dB")
