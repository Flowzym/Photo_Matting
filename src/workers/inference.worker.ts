import { setupOrt } from '@/utils/ort'
import { runU2Net } from '@/engine/u2net'
import { featherAlpha } from '@/engine/refineAlpha'

type Msg = { type: 'RUN_MATTING', payload: ImageBitmap|ImageData }
type Res = { type: 'ALPHA_DONE', payload: ImageData } | { type: 'ERROR', error: string }

self.addEventListener('message', async (ev: MessageEvent<Msg>) => {
  const msg = ev.data
  if (msg.type === 'RUN_MATTING') {
    try {
      await setupOrt()
      const src = msg.payload instanceof ImageBitmap
        ? bitmapToImageData(msg.payload)
        : msg.payload
      const alpha = await runU2Net(src)
      const refined = featherAlpha(alpha, 1)
      ;(self as any).postMessage({ type: 'ALPHA_DONE', payload: refined } as Res)
    } catch (e:any) {
      ;(self as any).postMessage({ type: 'ERROR', error: String(e?.message||e) } as Res)
    }
  }
})

function bitmapToImageData(bmp: ImageBitmap): ImageData {
  const c = new OffscreenCanvas(bmp.width, bmp.height)
  const ctx = c.getContext('2d')!
  ctx.drawImage(bmp, 0, 0)
  return ctx.getImageData(0,0,bmp.width, bmp.height)
}
