"""Shared team-card surface: preserve the shell, remove ribs, use fixed face UVs."""
import json
import struct
from pathlib import Path


SHADER = r"""
float2 p = saturate(UV);
float2 cell = floor(p * float2(440, 320));
float grain = frac(sin(dot(cell, float2(127.1,311.7)) + 2751.0) * 43758.5453);
float light = 0.20 + 0.82 * exp(-dot((p-float2(.20,.18))*float2(1.2,1.8), (p-float2(.20,.18))*float2(1.2,1.8)));
float edge = p.y < .48 ? .77 + .48*p.y : 1.00 - .50*(p.y-.48);
float d = p.x-edge;
float fold = 1.0 - .20*smoothstep(-.015,.025,d);
fold -= .14*exp(-pow((d+.018)/.035,2));
fold += .22*exp(-pow(d/.0022,2));
float corners = 1.0 - .35*pow(p.y,2)*pow(abs(p.x-.5)*2,2);
return TeamColor * light * fold * corners * (.80 + .40*grain);
"""


def smooth_shell(source, target):
    """Preserve source rim/footer/back geometry byte-for-byte; discard stripe primitives."""
    raw = Path(source).read_bytes()
    assert raw[:4] == b'glTF'
    size = struct.unpack_from('<I', raw, 12)[0]
    data = json.loads(raw[20:20+size])
    binary = bytearray(raw[28+size:])
    removed = 0
    for mesh in data['meshes']:
        kept = []
        for primitive in mesh['primitives']:
            material = data['materials'][primitive['material']]['name']
            if material in {'RaisedStripe', 'TeamAccent'}:
                removed += 1
                continue
            if material == 'TeamPanel':
                accessor = data['accessors'][primitive['attributes']['POSITION']]
                view = data['bufferViews'][accessor['bufferView']]
                start = view.get('byteOffset', 0) + accessor.get('byteOffset', 0)
                stride = view.get('byteStride', 12)
                assert accessor['componentType'] == 5126 and accessor['type'] == 'VEC3'
                uv = bytearray()
                for i in range(accessor['count']):
                    x, y, _ = struct.unpack_from('<fff', binary, start+i*stride)
                    uv.extend(struct.pack('<ff', (x+.492)/.984, (.436-y)/.726))
                binary.extend(b'\0' * (-len(binary) % 4))
                offset = len(binary)
                binary.extend(uv)
                data['bufferViews'].append({'buffer': 0, 'byteOffset': offset, 'byteLength': len(uv), 'target': 34962})
                data['accessors'].append({'bufferView': len(data['bufferViews'])-1, 'componentType': 5126,
                                          'count': accessor['count'], 'type': 'VEC2'})
                primitive['attributes']['TEXCOORD_0'] = len(data['accessors'])-1
            kept.append(primitive)
        mesh['primitives'] = kept
    assert removed > 0
    data['buffers'][0]['byteLength'] = len(binary)
    encoded = json.dumps(data, separators=(',', ':')).encode()
    encoded += b' ' * (-len(encoded) % 4)
    binary.extend(b'\0' * (-len(binary) % 4))
    result = struct.pack('<III', 0x46546c67, 2, 28+len(encoded)+len(binary))
    result += struct.pack('<II', len(encoded), 0x4e4f534a) + encoded
    result += struct.pack('<II', len(binary), 0x004e4942) + binary
    Path(target).write_bytes(result)
    return {'removedStripePrimitives': removed, 'path': str(target)}


def native_material(folder):
    """Create a reusable native material with team hue as its only parameter."""
    import unreal
    library = unreal.MaterialEditingLibrary
    material = unreal.AssetToolsHelpers.get_asset_tools().create_asset(
        'M_SculptedSatin', folder, unreal.Material, unreal.MaterialFactoryNew())
    assert material
    uv = library.create_material_expression(material, unreal.MaterialExpressionTextureCoordinate, -600, 0)
    hue = library.create_material_expression(material, unreal.MaterialExpressionVectorParameter, -600, 180)
    hue.set_editor_property('parameter_name', 'TeamColor')
    hue.set_editor_property('default_value', unreal.LinearColor(.77, .009, .038, 1))
    surface = library.create_material_expression(material, unreal.MaterialExpressionCustom, -300, 0)
    inputs = []
    for name in ('UV', 'TeamColor'):
        item = unreal.CustomInput()
        item.set_editor_property('input_name', name)
        inputs.append(item)
    surface.set_editor_property('inputs', inputs)
    surface.set_editor_property('code', SHADER)
    surface.set_editor_property('output_type', unreal.CustomMaterialOutputType.CMOT_FLOAT3)
    assert library.connect_material_expressions(uv, '', surface, 'UV')
    assert library.connect_material_expressions(hue, '', surface, 'TeamColor')
    assert library.connect_material_property(surface, '', unreal.MaterialProperty.MP_BASE_COLOR)
    for field, value in [('MP_ROUGHNESS', .64), ('MP_METALLIC', .08), ('MP_SPECULAR', .26)]:
        scalar = library.create_material_expression(material, unreal.MaterialExpressionConstant, -300, 300)
        scalar.set_editor_property('r', value)
        assert library.connect_material_property(scalar, '', getattr(unreal.MaterialProperty, field))
    library.recompile_material(material)
    assert unreal.EditorAssetLibrary.save_loaded_asset(material)
    return material
