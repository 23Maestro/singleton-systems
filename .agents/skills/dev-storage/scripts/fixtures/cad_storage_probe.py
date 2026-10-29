"""Small real geometry build used to verify the external CAD installation."""
import build123d as bd
from cadgen import model


@model
def storage_probe():
    body = bd.Box(10, 20, 5)
    body.label = 'HomeSSD storage verification'
    return body


if __name__ == '__main__':
    document = storage_probe()
    assert abs(document.shape.volume - 1000) < 0.001
    print(f'VERIFIED_DOCUMENT={document.id}')
    print(f'VERIFIED_VOLUME_MM3={document.shape.volume}')
