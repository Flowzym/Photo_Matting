export async function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file)
  const img = new Image()
  img.src = url
  await new Promise((res, rej)=>{ img.onload=()=>res(null); img.onerror=rej })
  return img
}

export function drawImageWithRotationToCanvas(img: HTMLImageElement, orientation?: number, maxEdge=2048): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')!

  let w = img.naturalWidth, h = img.naturalHeight
  let rotate = 0, flipX = false, flipY = false

  switch (orientation) {
    case 2: flipX = true; break
    case 3: rotate = 180; break
    case 4: flipY = true; break
    case 5: rotate = 90; flipY = true; break
    case 6: rotate = 90; break
    case 7: rotate = 270; flipY = true; break
    case 8: rotate = 270; break
  }

  const radians = rotate * Math.PI/180
  let dw = w, dh = h
  if (rotate % 180 !== 0) { dw = h; dh = w }

  // scale down to maxEdge
  const scale = Math.min(1, maxEdge / Math.max(dw, dh))
  dw = Math.round(dw * scale)
  dh = Math.round(dh * scale)

  canvas.width = dw
  canvas.height = dh

  ctx.save()
  // move to center
  ctx.translate(dw/2, dh/2)
  ctx.rotate(radians)
  ctx.scale(flipX? -1:1, flipY? -1:1)
  // draw with scaling
  const sx = -w/2 * scale
  const sy = -h/2 * scale
  ctx.drawImage(img, sx, sy, w*scale, h*scale)
  ctx.restore()
  return canvas
}
