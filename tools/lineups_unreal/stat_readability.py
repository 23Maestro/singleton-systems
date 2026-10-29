"""Validate projected glyph bounds against the actual native mask bounds."""
import math


def _bounds(node,key):
    values=[float(v) for v in node[key]]
    if len(values)!=4 or not all(math.isfinite(v) for v in values):
        raise ValueError('invalid bounds')
    if values[2]<values[0] or values[3]<values[1]:raise ValueError('inverted bounds')
    return values


def check_readability(readback,minimum=36):
    errors=[];heights=[]

    def text_check(name,node,mask):
        glyph=_bounds(node,'pixelBounds' if 'pixelBounds' in node else 'boundsPx')
        window=_bounds(mask,'boundsPx')
        inside=(glyph[0]>=window[0]-.5 and glyph[1]>=window[1]-.5
                and glyph[2]<=window[2]+.5 and glyph[3]<=window[3]+.5)
        if not inside:errors.append(name+' is clipped by its mask')
        height=max(0,min(glyph[3],window[3])-max(glyph[1],window[1]))
        if min(glyph[2],window[2])<=max(glyph[0],window[0]):height=0
        heights.append(height)
        if height<minimum:errors.append(name+' is below '+str(minimum)+' px')

    try:
        controls=readback['controls']
        if not readback['stats']:raise ValueError('missing stats')
        for i,row in enumerate(readback['stats'],1):
            text_check(f'stat {i} value',row['value'],controls['MASK_Stats_Box'])
            text_check(f'stat {i} label',row['label'],controls['MASK_Stat_Titles'])
        text_check('QB',controls['Text_Position'],controls['MASK_Text_Position'])
        text_check('season line',controls['Text_Asterisk'],controls['MASK_Main_Box'])
        if controls['Text_Asterisk']['typeface']!='Bold':
            errors.append('season line is not the requested Bold face')
    except (KeyError,TypeError,ValueError):errors.append('settled native readback is incomplete')
    return {'passed':not errors,'errors':errors,
            'minimumVisibleTextHeightPx':min(heights) if heights else None}
