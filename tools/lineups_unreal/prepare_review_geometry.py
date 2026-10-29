"""Make solid, beveled logo meshes from the approved alpha silhouettes."""
import hashlib
import json
from pathlib import Path
import numpy as np
from PIL import Image
from scipy.ndimage import distance_transform_edt

REPO = Path(__file__).resolve().parents[2]
def build_logo_geometry(config, out, n=384):
    out = Path(out)
    out.mkdir(parents=True, exist_ok=True)
    records = []
    for key in ['leftLogo', 'rightLogo']:
        record = config['assets'][key]
        src = Path(record['path'])
        assert hashlib.sha256(src.read_bytes()).hexdigest() == record['sha256']
        alpha = np.asarray(Image.open(src).convert('RGBA').getchannel('A').resize((n, n)))
        mask = alpha > 127
        dist = distance_transform_edt(mask)
        vertices, uvs, faces, edges = [], [], [], []
        ids = {}
        def vertex(i, j, back=False):
            k = (i, j, back)
            if k not in ids:
                near = dist[max(0,j-1):min(n,j+1), max(0,i-1):min(n,i+1)]
                d = float(near.min()) if near.size else 0
                x = 10.0 if back else -18.0 + max(0.0, 2.5-d)*2.4
                vertices.append((x, (i/n-.5)*500, (.5-j/n)*500))
                uvs.append((i/n, 1-j/n)); ids[k] = len(vertices)
            return ids[k]
        for j,i in np.argwhere(mask):
            a,b,c,d = [vertex(x,y) for x,y in [(i,j),(i+1,j),(i+1,j+1),(i,j+1)]]
            aa,bb,cc,dd = [vertex(x,y,True) for x,y in [(i,j),(i+1,j),(i+1,j+1),(i,j+1)]]
            faces.extend([(a,b,c),(a,c,d)])
            edges.extend([(aa,cc,bb),(aa,dd,cc)])
            for di,dj,p,q,pp,qq in [(0,-1,a,b,aa,bb),(1,0,b,c,bb,cc),(0,1,c,d,cc,dd),(-1,0,d,a,dd,aa)]:
                x,y=i+di,j+dj
                if x<0 or x>=n or y<0 or y>=n or not mask[y,x]: edges.extend([(p,pp,qq),(p,qq,q)])
        target=out/(key+'Smooth.obj')
        with target.open('w') as f:
            f.write('mtllib logo.mtl\n')
            for v in vertices:f.write('v %.5f %.5f %.5f\n'%v)
            for uv in uvs:f.write('vt %.7f %.7f\n'%uv)
            for material,triangles in [('Face',faces),('Edge',edges)]:
                f.write('usemtl '+material+'\ns 1\n')
                for tri in triangles:f.write('f '+' '.join(f'{k}/{k}' for k in tri)+'\n')
        records.append({'key':key,'path':str(target),'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'triangles':len(faces)+len(edges),'sourceSha256':record['sha256']})
    (out/'logo.mtl').write_text('newmtl Face\nKd 0.5 0.5 0.5\nnewmtl Edge\nKd 0.1 0.1 0.1\n')
    quad=out/'quad.obj'
    quad.write_text('v 0 -0.5 0.5\nv 0 0.5 0.5\nv 0 0.5 -0.5\nv 0 -0.5 -0.5\nvt 0 1\nvt 1 1\nvt 1 0\nvt 0 0\nf 1/1 2/2 3/3\nf 1/1 3/3 4/4\n')
    (out/'geometry.json').write_text(json.dumps(records,indent=2)+'\n')
    return records


if __name__ == "__main__":
    config = json.loads((REPO / "config/unreal/comparison-template.json").read_text())
    out = Path("/Volumes/UnrealSSD/Generated/CATENA_MEDIA_LINEUPS/source/unreal/projects/SportsBroadcastTrial58/SourceArt/LineupsReview")
    assert out.parent.parent.joinpath("LineupsSportsTrial.uproject").is_file()
    print(json.dumps(build_logo_geometry(config, out)))
