"""Data slots for approved Lane 4A. Times are landing frames at 25 fps."""
import copy
import json
import re
from pathlib import Path


def check(value):
    data = copy.deepcopy(value)
    def need(ok, message):
        if not ok:
            raise ValueError(message)
    need(type(data.get('frames')) is int and data['frames'] >= 250, 'frames must be at least 250 (10 seconds)')
    need(isinstance(data.get('title'), str) and 0 < len(data['title']) <= 24, 'title needs 1..24 characters')
    players = data.get('players')
    need(isinstance(players, list) and len(players) == 2, 'exactly 2 players required')
    for player in players:
        need(isinstance(player, dict), 'player must be an object')
        need(isinstance(player.get('name'), str) and 0 < len(player['name']) <= 24, 'player name needs 1..24 characters')
        for key in ('cutout', 'logo'):
            need(isinstance(player.get(key), str) and Path(player[key]).is_file(), f'player {key} file is missing')
        for key in ('primary', 'secondary', 'plate', 'logoDark'):
            need(isinstance(player.get(key), str) and re.fullmatch(r'#[0-9a-fA-F]{6}', player[key]), f'{key} must be #RRGGBB')
    rows = data.get('stats')
    need(isinstance(rows, list) and len(rows) == 4, 'the approved table requires exactly 4 stat rows')
    for row in rows:
        need(isinstance(row, dict), 'stat row must be an object')
        for key in ('label', 'left', 'right'):
            need(isinstance(row.get(key), str) and 0 < len(row[key]) <= 12, f'stat {key} needs 1..12 characters')
        need(type(row.get('frame')) is int and 66 <= row['frame'] <= data['frames'] - 50,
             'row landing frame must follow the opening and leave a 2 second hold')
    frames = [r['frame'] for r in rows]
    need(all(a < b for a, b in zip(frames, frames[1:])), 'row landing frames must increase')
    return data


def load(path):
    return check(json.loads(Path(path).read_text()))
