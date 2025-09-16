export function featherAlpha(alpha: ImageData, radius=1): ImageData {
  const w = alpha.width, h = alpha.height
  const out = new ImageData(w,h)
  // simple box blur on alpha channel only
  const src = alpha.data
  const dst = out.data
  const getA = (x:number,y:number)=> src[(y*w+x)*4+3]
  const setA = (x:number,y:number,v:number)=> { const i=(y*w+x)*4; dst[i]=0; dst[i+1]=0; dst[i+2]=0; dst[i+3]=v }
  for (let y=0;y<h;y++){
    for (let x=0;x<w;x++){
      let sum=0, cnt=0
      for (let dy=-radius; dy<=radius; dy++){
        for (let dx=-radius; dx<=radius; dx++){
          const xx=x+dx, yy=y+dy
          if (xx>=0&&yy>=0&&xx<w&&yy<h){ sum += getA(xx,yy); cnt++ }
        }
      }
      setA(x,y, Math.round(sum/cnt))
    }
  }
  return out
}
