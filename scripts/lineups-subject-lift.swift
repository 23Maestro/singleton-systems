import Vision
import CoreImage
import CoreImage.CIFilterBuiltins
import AppKit
let a = CommandLine.arguments
let url = URL(fileURLWithPath: a[1])
let ci = CIImage(contentsOf: url)!
let h = VNImageRequestHandler(ciImage: ci)
let r = VNGenerateForegroundInstanceMaskRequest()
try h.perform([r])
guard let obs = r.results?.first else { print("no subject"); exit(1) }
// keep only the largest instance (the player), not the background official
var best = 1; var bestN = 0
let mask0 = try obs.generateScaledMaskForImage(forInstances: obs.allInstances, from: h)
for i in obs.allInstances {
  let m = try obs.generateScaledMaskForImage(forInstances: IndexSet(integer: i), from: h)
  let c = CIImage(cvPixelBuffer: m)
  let avg = CIFilter(name: "CIAreaAverage", parameters: [kCIInputImageKey: c, kCIInputExtentKey: CIVector(cgRect: c.extent)])!.outputImage!
  var px = [Float](repeating: 0, count: 4)
  CIContext().render(avg, toBitmap: &px, rowBytes: 16, bounds: CGRect(x: 0, y: 0, width: 1, height: 1), format: .RGBAf, colorSpace: nil)
  let n = Int(px[0] * 1e6); print("instance", i, n); if n > bestN { bestN = n; best = i }
}
_ = mask0
let out = try obs.generateMaskedImage(ofInstances: IndexSet(integer: best), from: h, croppedToInstancesExtent: true)
let img = CIImage(cvPixelBuffer: out)
let ctx = CIContext()
try ctx.writePNGRepresentation(of: img, to: URL(fileURLWithPath: a[2]), format: .RGBA8, colorSpace: CGColorSpace(name: CGColorSpace.sRGB)!)
print("ok", img.extent)
