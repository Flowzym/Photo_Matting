import React from 'react'
import { useAppState } from '@/state/useAppState'

export default function BGPicker(){
  const { background, set } = useAppState()
  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button className={`px-3 py-1 rounded border ${background.type==='color'&&'bg-gray-900 text-white'}`} onClick={()=>set({background:{type:'color', color:'#ffffff'}})}>Farbe</button>
        <button className={`px-3 py-1 rounded border ${background.type==='gradient'&&'bg-gray-900 text-white'}`} onClick={()=>set({background:{type:'gradient', from:'#f8fafc', to:'#e5e7eb', angle:90}})}>Verlauf</button>
        <button className={`px-3 py-1 rounded border ${background.type==='pattern'&&'bg-gray-900 text-white'}`} onClick={()=>set({background:{type:'pattern', kind:'stripes'}})}>Muster</button>
      </div>
      {background.type==='color' && (
        <div>
          <input type="color" value={background.color} onChange={e=>set({background:{type:'color', color: e.target.value}})} />
        </div>
      )}
      {background.type==='gradient' && (
        <div className="flex gap-3 items-center">
          <label className="text-sm">Von <input type="color" value={background.from} onChange={e=>set({background:{...background, from:e.target.value}})} /></label>
          <label className="text-sm">Nach <input type="color" value={background.to} onChange={e=>set({background:{...background, to:e.target.value}})} /></label>
          <label className="text-sm">Winkel <input type="range" min="0" max="180" value={background.angle} onChange={e=>set({background:{...background, angle: parseInt(e.target.value)}})} /></label>
        </div>
      )}
      {background.type==='pattern' && (
        <div className="flex gap-2">
          {(['stripes','dots','grid'] as const).map(k=>(
            <button key={k} className={`px-3 py-1 rounded border ${background.kind===k&&'bg-gray-900 text-white'}`} onClick={()=>set({background:{type:'pattern', kind:k}})}>{k}</button>
          ))}
        </div>
      )}
    </div>
  )
}
