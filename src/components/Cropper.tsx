import React, { useRef, useState, useEffect } from 'react'
import { useAppState } from '@/state/useAppState'

type Ratio = 'free'|'1:1'|'3:4'|'4:3'|'2:3'

export default function Cropper(){
  const { cropped, set, roundMask } = useAppState()
  const [ratio, setRatio] = useState<Ratio>('3:4')
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({x:0,y:0})
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(()=>{
    if (!cropped || !ref.current) return
    const src = cropped
    const w = src.width, h = src.height
    const ctx = ref.current.getContext('2d')!
    ref.current.width = w
    ref.current.height = h
    ctx.clearRect(0,0,w,h)
    if (roundMask){
      ctx.save()
      const r = Math.min(w,h)/2
      ctx.beginPath(); ctx.arc(w/2,h/2,r,0,Math.PI*2); ctx.clip()
      ctx.drawImage(src, offset.x, offset.y, w*zoom, h*zoom)
      ctx.restore()
    } else {
      ctx.drawImage(src, offset.x, offset.y, w*zoom, h*zoom)
    }
  }, [cropped, roundMask, zoom, offset])

  function applyCrop(){
    if (!ref.current) return
    const out = document.createElement('canvas')
    const w = ref.current.width, h = ref.current.height
    // compute target size by ratio
    let tw=w, th=h
    const [a,b] = ratio==='free' ? [w,h] : ratio.split(':').map(Number)
    if (ratio!=='free'){
      const target = a/b
      const cur = w/h
      if (cur>target){ th = h; tw = Math.round(th*target) }
      else { tw = w; th = Math.round(tw/target) }
    }
    out.width = tw; out.height = th
    const ctx = out.getContext('2d')!
    const sx = Math.floor((w - tw)/2), sy = Math.floor((h - th)/2)
    ctx.drawImage(ref.current, sx, sy, tw, th, 0, 0, tw, th)
    useAppState.getState().set({ cropped: out })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {(['free','1:1','3:4','4:3','2:3'] as Ratio[]).map(r=>(
          <button key={r} onClick={()=>setRatio(r)}
            className={`px-3 py-1 rounded border ${ratio===r?'bg-gray-900 text-white':'bg-white'}`}>{r}</button>
        ))}
        <label className="ml-4 text-sm">Rund:
          <input type="checkbox" className="ml-1" checked={roundMask} onChange={e=>set({ roundMask: e.target.checked })} />
        </label>
        <label className="ml-4 text-sm">Zoom:
          <input type="range" min="0.5" max="2" step="0.01" value={zoom} onChange={e=>setZoom(parseFloat(e.target.value))} className="ml-2"/>
        </label>
      </div>
      <div className="bg-checker rounded-lg overflow-hidden">
        <canvas ref={ref} className="max-w-full h-auto block mx-auto" />
      </div>
      <div className="flex gap-2">
        <button className="px-4 py-2 rounded bg-gray-900 text-white" onClick={applyCrop}>Zuschneiden übernehmen</button>
        <button className="px-4 py-2 rounded border" onClick={()=>{ setZoom(1); setOffset({x:0,y:0}) }}>Reset</button>
      </div>
    </div>
  )
}
