"""Screen-space layout for measured native glyphs; never reduce type to fit."""
import math


def distribute_stats(measurements, left, right, padding=32, minimum_gap=16, gap_px=None, offset_x=0, space_evenly=False):
    if len(measurements) not in (3, 4):
        raise ValueError('Stat Breakdown supports three or four points')
    widths = [max(float(row['value']), float(row['label'])) for row in measurements]
    if not all(math.isfinite(w) and w > 0 for w in widths):
        raise ValueError('Glyph geometry must be ready before layout')
    if not all(math.isfinite(v) for v in (left, right, padding, minimum_gap)) or padding < 0 or minimum_gap < 0:
        raise ValueError('Invalid card geometry')
    available = right - left - 2 * padding
    if space_evenly:
        gap=(right-left-sum(widths))/(len(widths)+1)
        if gap<max(padding,minimum_gap):
            raise ValueError('Stats exceed the card: grow the card or revise copy; do not shrink type')
        cursor=left+gap;groups=[]
        for width in widths:
            groups.append({'left':cursor,'right':cursor+width,'center':cursor+width/2})
            cursor+=width+gap
        return {'mode':'space-evenly','groups':groups,'gapPx':gap,'paddingPx':gap,
                'offsetXPx':0,'glyphWidthsPx':widths}
    # Equal columns put the middle of a three-point row at the card center.
    # Wider four-point data may need content-sized groups at the same font size.
    equal = gap_px is None and max(widths) * len(widths) + minimum_gap * (len(widths) - 1) <= available
    containers = [max(widths)] * len(widths) if equal else widths
    gap = (available - sum(containers)) / (len(containers) - 1) if gap_px is None else float(gap_px)
    if not math.isfinite(gap) or not math.isfinite(offset_x):
        raise ValueError('Invalid stat spacing')
    if gap < minimum_gap - 1e-6:
        raise ValueError('Stats exceed the card: grow the card or revise copy; do not shrink type')
    used = sum(containers) + gap * (len(containers)-1)
    cursor = left + padding + (available-used)/2 + offset_x
    if cursor < left+padding-1e-6 or cursor+used > right-padding+1e-6:
        raise ValueError('Shifted stats exceed the card; preserve type and revise spacing')
    groups = []
    for width in containers:
        groups.append({'left': cursor, 'right': cursor + width, 'center': cursor + width / 2})
        cursor += width + gap
    return {'mode': 'packed-content' if gap_px is not None else 'equal-columns' if equal else 'content-width', 'groups': groups,
            'gapPx': gap, 'paddingPx': padding, 'offsetXPx': offset_x, 'glyphWidthsPx': widths}


def point_settings(settings, points):
    return {**{key:value for key,value in settings.items() if key!='variants'},
            **settings.get('variants',{}).get(str(points),{})}


def hug_callout(bounds, padding_x=20, padding_y=10):
    left, top, right, bottom = [float(v) for v in bounds]
    if not all(math.isfinite(v) for v in (left, top, right, bottom, padding_x, padding_y)) or right <= left or bottom <= top or min(padding_x, padding_y) < 0:
        raise ValueError('Callout glyph geometry is not ready')
    return [left-padding_x, top-padding_y, right+padding_x, bottom+padding_y]


def check_stat_layout(readback, settings, tolerance=1):
    """Compare native rendered bounds with a fresh content-dependent layout."""
    errors = []
    try:
        card = readback['cardBoundsPx']; mask = readback['controls']['MASK_Stats_Box']['boundsPx']
        left, right = max(card[0], mask[0]), min(card[2], mask[2])
        rows = readback['stats']
        measurements = [{k: row[k]['pixelBounds'][2]-row[k]['pixelBounds'][0] for k in ('value', 'label')} for row in rows]
        settings = point_settings(settings, len(rows))
        expected = distribute_stats(measurements, left, right, settings['paddingPx'], settings['minimumGapPx'],settings.get('gapPx'),settings.get('offsetXPx',0),settings.get('mode')=='space-evenly')
        if settings.get('equalOuterPadding'):
            # Validate the visible content, including camera movement, rather
            # than empty equal-width containers or a fixed screen-space shift.
            groups=[]
            for i,row in enumerate(rows,1):
                value=row['value']['pixelBounds'];label=row['label']['pixelBounds']
                if abs((value[0]+value[2]-label[0]-label[2])/2)>tolerance:
                    errors.append(f'stat {i} value is not centered over its label')
                groups.append([min(value[0],label[0]),max(value[2],label[2])])
            gaps=[b[0]-a[1] for a,b in zip(groups,groups[1:])]
            outer=[groups[0][0]-left,right-groups[-1][1]]
            if min(outer)<settings['paddingPx']-tolerance:
                errors.append('stats exceed the card padding')
            if abs(outer[0]-outer[1])>2*tolerance:
                errors.append('left and right visible padding differ')
            if min(gaps)<settings['minimumGapPx']-tolerance or max(gaps)-min(gaps)>2*tolerance:
                errors.append('visible gaps between stats differ')
            if settings.get('mode')=='space-evenly' and max(gaps+outer)-min(gaps+outer)>2*tolerance:
                errors.append('inner gaps and outer padding differ')
            return {'passed':not errors,'errors':errors,**expected,
                    'observedOuterPaddingPx':outer,'observedGapsPx':gaps}
        for i, (row, group) in enumerate(zip(rows, expected['groups']), 1):
            for kind in ('value', 'label'):
                b = row[kind]['pixelBounds']
                if abs((b[0]+b[2])/2-group['center']) > tolerance:
                    errors.append(f'stat {i} {kind} is not centered in its data-sized group')
        return {'passed': not errors, 'errors': errors, **expected}
    except (KeyError, TypeError, ValueError):
        return {'passed': False, 'errors': ['native stat layout is incomplete or overflows']}


def check_callout(controls, settings, tolerance=1):
    errors=[];expected=None;plate=None
    try:
        footer=controls['Text_Asterisk'];back=controls['LineupsStat_SpeakerCallout']
        expected=hug_callout(footer['boundsPx'],settings['paddingXPx'],settings['paddingYPx'])
        plate=back['boundsPx']
        if len(plate)!=4 or not all(math.isfinite(v) and abs(a-v)<tolerance for a,v in zip(expected,plate)):
            errors.append('speaker callout does not hug its text')
        if not back['sortPriorities'] or not footer['sortPriorities'] or max(back['sortPriorities'])>=min(footer['sortPriorities']):
            errors.append('speaker callout covers its text in the native sort order')
    except (KeyError,TypeError,ValueError):errors.append('native callout readback is incomplete')
    return {'passed':not errors,'errors':errors,'expectedBoundsPx':expected,'actualBoundsPx':plate}
