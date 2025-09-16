import React from 'react'
import { useAppState } from '@/state/useAppState'
import { renderComposite } from '@/engine/compose'

export default function ExportBar(){
  const { cropped, alpha, background, roundMask, exportFormat, exportSize, set } = useAppState()
  function doExport(){
    if (!cropped) return
    let src = cropped
    if (exportSize!=='original'){
      const target = exportSize==='1024' ? 1024 : 2048
      const scale = target / Math.max(src.width, src.height)
      const c = document.createElement('canvas')
      c.width = Math.round(src.width*scale); c.height = Math.round(src.height*scale)
      c.getContext('2d')!.drawImage(src, 0,0, c.width, c.height)
      src = c
    }
    const out = renderComposite(src, alpha, background, roundMask)
    const mime = exportFormat==='png' ? 'image/png' : 'image/jpeg'
    const data = out.toDataURL(mime, exportFormat==='jpg' ? 0.9 : undefined)
    const a = document.createElement('a')
    const ts = new Date().toISOString().replaceAll(':','').replaceAll('.','').slice(0,15)
    a.download = `cvphoto_${ts}.${exportFormat}`
    a.href = data
    a.click()
  }
  return (
    <div className="flex flex-wrap items-center gap-3">
      <label>Format:
        <select className="ml-2 border p-1 rounded" value={exportFormat} onChange={e=>set({exportFormat: e.target.value as any})}>
          <option value="png">PNG (transp.)</option>
          <option value="jpg">JPG</option>
        </select>
      </label>
      <label>Größe:
        <select className="ml-2 border p-1 rounded" value={exportSize} onChange={e=>set({exportSize: e.target.value as any})}>
          <option value="original">Original</option>
          <option value="1024">1024px</option>
          <option value="2048">2048px</option>
        </select>
      </label>
      <button className="px-4 py-2 rounded bg-emerald-600 text-white" onClick={doExport}>Download</button>
    </div>
  )
}
