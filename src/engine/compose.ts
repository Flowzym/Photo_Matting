import { createCanvas } from '@/utils/canvas'
import type { Background } from '@/state/useAppState'

export function renderComposite(src: HTMLCanvasElement, alpha?: ImageData, bg?: Background, round=false): HTMLCanvasElement {
  const w = src.width, h = src.height
  const out = createCanvas(w,h)
  const ctx = out.getContext('2d')!

  // Background
  if (!bg || bg.type==='color') {
    ctx.fillStyle = (bg && bg.type==='color') ? bg.color : '#ffffff'
    ctx.fillRect(0,0,w,h)
  } else if (bg.type==='gradient') {
    const angle = (bg.angle||0) * Math.PI/180
    const x = Math.cos(angle), y = Math.sin(angle)
    const cx = (w/2)*(1-x), cy = (h/2)*(1-y)
    const grad = ctx.createLinearGradient(cx,cy, w-cx, h-cy)
    grad.addColorStop(0, bg.from); grad.addColorStop(1, bg.to)
    ctx.fillStyle = grad; ctx.fillRect(0,0,w,h)
  } else if (bg.type==='image' && bg.file) {
    // draw as pattern using object URL
    const url = URL.createObjectURL(bg.file)
    const img = new Image(); img.src = url
    // Synchronous blocking not possible; we leave it blank here. Caller should pre-render.
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0,0,w,h)
  } else if (bg.type==='pattern') {
    // simple canvas pattern
    const tile = createCanvas(40,40)
    const tctx = tile.getContext('2d')!
    tctx.fillStyle = '#f3f4f6'; tctx.fillRect(0,0,40,40)
    if (bg.kind==='stripes') {
      tctx.fillStyle = '#e5e7eb'
      for (let i=0;i<40;i+=8) { tctx.fillRect(i,0,4,40) }
    } else if (bg.kind==='dots') {
      tctx.fillStyle = '#e5e7eb'
      for (let y=4;y<40;y+=10) for (let x=4;x<40;x+=10) {
        tctx.beginPath(); tctx.arc(x,y,2,0,Math.PI*2); tctx.fill()
      }
    } else {
      tctx.strokeStyle = '#e5e7eb'
      for (let i=0;i<=40;i+=8){ tctx.beginPath(); tctx.moveTo(i,0); tctx.lineTo(i,40); tctx.stroke()
                               tctx.beginPath(); tctx.moveTo(0,i); tctx.lineTo(40,i); tctx.stroke() }
    }
    const pat = ctx.createPattern(tile, 'repeat')!
    ctx.fillStyle = pat; ctx.fillRect(0,0,w,h)
  }

  // Optional round clip
  if (round) {
    ctx.save()
    const r = Math.min(w,h)/2
    ctx.beginPath(); ctx.arc(w/2, h/2, r, 0, Math.PI*2); ctx.clip()
  }

  // Person masked
  if (!alpha) {
    ctx.drawImage(src, 0,0)
  } else {
    const tmp = createCanvas(w,h)
    const tctx = tmp.getContext('2d')!
    tctx.drawImage(src, 0,0)
    const img = tctx.getImageData(0,0,w,h)
    for (let i=0;i<w*h;i++){
      img.data[i*4+3] = alpha.data[i*4+3]
    }
    tctx.putImageData(img, 0,0)
    ctx.drawImage(tmp, 0,0)
  }
  if (round) ctx.restore()

  return out
}
