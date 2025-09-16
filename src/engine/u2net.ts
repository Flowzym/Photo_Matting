import { ort, getBase } from '@/utils/ort'
import { createCanvas } from '@/utils/canvas'

let session: any

export async function ensureU2Net() {
  if (session) return session
  const url = getBase + 'models/u2netp.onnx'
  try {
    session = await ort.InferenceSession.create(url, { 
      executionProviders: ['wasm'],
      graphOptimizationLevel: 'all'
    })
    return session
  } catch (e:any) {
    console.error('[U2NET] session create failed:', e.message || e)
    console.error('[U2NET] attempted to load from:', url)
    throw new Error('ORT_UNAVAILABLE')
  }
}

function preprocess(img: ImageData, size=320) {
  // Resize to square with letterbox
  const srcW = img.width, srcH = img.height
  const scale = Math.min(size/srcW, size/srcH)
  const tW = Math.round(srcW*scale), tH = Math.round(srcH*scale)

  const canvas = createCanvas(size, size)
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#000'; ctx.fillRect(0,0,size,size)
  // draw resized image centered
  const x = Math.floor((size - tW)/2), y = Math.floor((size - tH)/2)
  // put src imagedata on temp canvas for drawImage
  const tmp = createCanvas(srcW, srcH)
  tmp.getContext('2d')!.putImageData(img, 0, 0)
  ctx.drawImage(tmp, 0, 0, srcW, srcH, x, y, tW, tH)

  const { data } = ctx.getImageData(0,0,size,size)
  // HWC -> CHW float32 normalized to 0..1, subtract mean?
  const chw = new Float32Array(1*3*size*size)
  let p=0
  for (let i=0;i<size*size;i++) {
    const r = data[i*4+0]/255
    const g = data[i*4+1]/255
    const b = data[i*4+2]/255
    chw[0*size*size + i] = r
    chw[1*size*size + i] = g
    chw[2*size*size + i] = b
  }
  return { tensor: chw, size, scale, offsetX: x, offsetY: y, tW, tH, srcW, srcH }
}

function postprocess(mask: Float32Array, prep: any): ImageData {
  // mask is size*size values (0..1). Map back to src size respecting letterbox
  const { size, srcW, srcH, offsetX, offsetY, tW, tH } = prep
  const canvas = createCanvas(srcW, srcH)
  const ctx = canvas.getContext('2d')!
  const out = ctx.createImageData(srcW, srcH)
  // Write black
  for (let i=0;i<out.data.length;i+=4) { out.data[i+3]=0 }
  // Draw resized mask region into target box
  const tmp = createCanvas(size, size)
  const tctx = tmp.getContext('2d')!
  // Put mask to tmp as grayscale
  const id = tctx.createImageData(size, size)
  for (let i=0;i<size*size;i++) {
    const v = Math.max(0, Math.min(255, Math.round(mask[i]*255)))
    id.data[i*4+0]=v; id.data[i*4+1]=v; id.data[i*4+2]=v; id.data[i*4+3]=255
  }
  tctx.putImageData(id, 0, 0)
  // Scale mask into original letterboxed rect
  const maskBox = createCanvas(srcW, srcH)
  const mctx = maskBox.getContext('2d')!
  mctx.drawImage(tmp, offsetX, offsetY, tW, tH)
  const mdata = mctx.getImageData(0,0,srcW, srcH).data
  for (let i=0;i<srcW*srcH;i++) {
    out.data[i*4+3] = mdata[i*4] // alpha
  }
  return out
}

export async function runU2Net(input: ImageData): Promise<ImageData> {
  const sess = await ensureU2Net()
  const prep = preprocess(input, 320)
  const tensor = new ort.Tensor('float32', prep.tensor, [1,3,prep.size,prep.size])
  const feeds = {}
  const inputName = sess.inputNames[0]
  feeds[inputName] = tensor
  const out = await sess.run(feeds)
  const outputName = sess.outputNames[0]
  const mat = out[outputName].data as Float32Array
  // Some U2Net variants emit 1x1xHxW; ensure we read length size*size
  const mask = mat.length === prep.size*prep.size ? mat : new Float32Array(prep.size*prep.size).fill(1)
  return postprocess(mask, prep)
}
