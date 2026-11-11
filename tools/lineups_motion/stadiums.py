"""Resolve the spoken focus team to its canonical Eagle stadium, without backfill."""
import hashlib
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
REGISTRY = ROOT / 'config/lineups/team-stadiums.json'
LEGACY_HASHES = {'508bd3cdcf3b17bf83fe30c50b1b2b11c66e3043', '6c84d05a7f038c5e3f9f14a4103cd9b533251e70'}
NFL_TEAMS = '''Arizona Cardinals|Atlanta Falcons|Baltimore Ravens|Buffalo Bills|Carolina Panthers|Chicago Bears|Cincinnati Bengals|Cleveland Browns|Dallas Cowboys|Denver Broncos|Detroit Lions|Green Bay Packers|Houston Texans|Indianapolis Colts|Jacksonville Jaguars|Kansas City Chiefs|Las Vegas Raiders|Los Angeles Chargers|Los Angeles Rams|Miami Dolphins|Minnesota Vikings|New England Patriots|New Orleans Saints|New York Giants|New York Jets|Philadelphia Eagles|Pittsburgh Steelers|San Francisco 49ers|Seattle Seahawks|Tampa Bay Buccaneers|Tennessee Titans|Washington Commanders'''.split('|')


def teams():
    names = set(NFL_TEAMS)
    names.update(r['team'] for r in json.loads(REGISTRY.read_text())['teams'])
    return sorted(names)


def mentions(text):
    found = []
    for team in teams():
        # Full names and unique NFL nicknames; cities alone can be ambiguous.
        aliases = [team, team.split()[-1]]
        matches = [m.start() for alias in aliases
                   for m in re.finditer(r'(?<!\w)' + re.escape(alias) + r'(?!\w)', text, re.I)]
        if matches:
            found.append((min(matches), team))
    return sorted(found)


def focus_team(candidate):
    for key in ('focusTeam', 'subjectTeam', 'mainTeam', 'team'):
        value = candidate.get(key)
        if isinstance(value, str) and value.strip():
            exact = [team for team in teams() if value.casefold().strip() in {
                team.casefold(), team.split()[-1].casefold(), team.rsplit(' ', 1)[0].casefold()}]
            if len(exact) == 1:
                return exact[0]
            matches = mentions(value)
            return matches[0][1] if len(matches) == 1 else value.strip()
    for key in ('title', 'excerpt', 'transcriptPhrase', 'statement'):
        text = candidate.get(key) or ''
        found = mentions(text)
        if len(found) == 1:
            return found[0][1]
        if len(found) > 1:
            # The grammatical subject is the focus, not whichever team won.
            between = text[found[0][0]:found[1][0]]
            if re.search(r'\b(beat|beats|defeated|defeats|lost to|loses to|won over)\b', between, re.I):
                return found[0][1]
            continue
    return None


def uses_stadium(candidate):
    background = candidate.get('background') or candidate.get('setting') or ''
    if isinstance(background, dict):
        background = json.dumps(background)
    if re.search(r'field.?night|field-night-no-football|Team Stadium', background, re.I) or any(h in background for h in LEGACY_HASHES):
        return True
    lane = candidate.get('lane', '')
    option = candidate.get('approvedOption', candidate.get('option', ''))
    return lane in {'stat breakdown', 'year-by-year', 'asset swap', 'recurring board'} or (
        lane == 'comparison' and option != 'Cinematic 2-up')


def resolve_stadium(candidate, *, required=None, verify_file=False):
    if not (uses_stadium(candidate) if required is None else required):
        return {'status': 'not-applicable'}
    team = focus_team(candidate)
    if not team:
        return {'status': 'needs-focus', 'flag': 'Stadium focus team needed', 'candidateId': candidate.get('id', candidate.get('sceneId'))}
    row = next((r for r in json.loads(REGISTRY.read_text())['teams'] if r['team'] == team), None)
    if row is None:
        return {'status': 'missing', 'focusTeam': team, 'flag': f'Stadium photo needed: {team}'}
    if verify_file and (not Path(row['filePath']).is_file() or hashlib.sha256(Path(row['filePath']).read_bytes()).hexdigest() != row['sha256']):
        return {'status': 'missing', 'focusTeam': team, 'flag': f'Stadium photo needed: {team}', 'reason': 'Eagle file is missing or its checksum changed'}
    return {'status': 'ready', 'focusTeam': team, 'eagleItemId': row['eagleItemId'], 'eagleUrl': row['eagleUrl'],
            'sourceSha256': row['sha256'], 'filePath': row['filePath']}


def validate_binding(binding):
    expected = resolve_stadium({'focusTeam': binding.get('focusTeam')}, required=True)
    if expected['status'] != 'ready' or any(binding.get(k) != expected[k] for k in ('focusTeam', 'eagleItemId', 'sourceSha256')):
        raise ValueError('Team stadium binding does not match its canonical Eagle source')
    if binding.get('imageHash') in LEGACY_HASHES or not re.fullmatch(r'[a-f0-9]{40}', binding.get('imageHash', '')):
        raise ValueError('Team stadium requires its actual uploaded Figma image hash')
    return expected


def main():
    request = json.load(sys.stdin)
    rows = request if isinstance(request, list) else request.get('candidates', request.get('scenes', [request]))
    print(json.dumps([{'candidateId': r.get('id', r.get('sceneId')), **resolve_stadium(r, verify_file=True)} for r in rows]))


if __name__ == '__main__':
    main()
