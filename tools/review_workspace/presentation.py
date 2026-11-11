"""Small visual plans and legible thumbnails. No finished artwork is implied."""
import hashlib
import json
import re
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


def foreground(color):
    rgb = [int(color[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    rgb = [v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4 for v in rgb]
    luminance = sum(v * w for v, w in zip(rgb, (.2126, .7152, .0722)))
    return '#111111' if (luminance + .05) / .05 > 1.05 / (luminance + .05) else '#ffffff'


def prepare_plan(candidate):
    teams = json.loads(Path(__file__).with_name('team-colors.json').read_text())['teams']
    title = candidate['title']
    team = next((t for t in teams if t['name'].casefold() in title.casefold()
                 or t['name'].split()[-1].casefold() in title.casefold()), None)
    color = team['color'] if team else '#252529'
    rank = candidate['lane'] == 'recurring board'
    copy = str(candidate.get('copy') or title)
    parts = [p.strip() for p in re.split(r' / | \| | · ', copy) if p.strip()]
    layout = 'rank' if rank else 'comparison' if candidate['lane'] == 'comparison' else 'facts' if candidate['lane'] == 'stat breakdown' else 'statement'
    if rank:
        copy = re.sub(r'^#?\d+[. ]+', '', title).strip()
        parts = [copy]
    return {'layout': layout, 'headline': copy, 'items': parts, 'background': color,
            'foreground': foreground(color), 'team': team['name'] if team else None}


def thumbnail(plan, output):
    image = Image.new('RGB', (960, 540), plan['background'])
    draw = ImageDraw.Draw(image)
    paths = [Path.home() / 'Library/Fonts/Poppins-SemiBold.ttf',
             Path.home() / 'Library/Fonts/Poppins-Bold.ttf']
    selected = next((p for p in paths if p.exists()), None)
    text = plan['headline'].upper()
    for size in range(108 if plan['layout'] == 'rank' else 84, 27, -2):
        face = ImageFont.truetype(str(selected), size) if selected else ImageFont.load_default(size=size)
        lines, line = [], ''
        for word in text.split():
            trial = (line + ' ' + word).strip()
            if line and draw.textlength(trial, font=face) > 840:
                lines.append(line)
                line = word
            else:
                line = trial
        if line:
            lines.append(line)
        if all(draw.textlength(line, font=face) <= 840 for line in lines) and len(lines) * size * 1.35 <= 420:
            break
    y = (540 - len(lines) * size * 1.35) / 2
    for line in lines:
        draw.text((480, y), line, anchor='mt', font=face, fill=plan['foreground'])
        y += size * 1.35
    pending = output / 'assets' / 'plan-thumbnail.png'
    image.save(pending)
    digest = hashlib.sha256(pending.read_bytes()).hexdigest()
    target = output / 'assets' / ('plan-' + digest[:16] + '.png')
    pending.replace(target)
    return str(target.relative_to(output))
