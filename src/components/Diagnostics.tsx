import React, { useEffect, useState } from 'react'
import { getBase } from '@/utils/ort'

export default function Diagnostics(){
  const base = getBase()
  const [present, setPresent] = useState<Record<string, boolean>>({})
  const [coi, setCoi] = useState<boolean>(false)
  useEffect(()=>{
    setCoi(!!(globalThis as any).crossOriginIsolated)
    const files = ['ort-wasm.wasm','ort-wasm.mjs','ort-wasm-simd.wasm','ort-wasm-simd.mjs','ort-wasm-simd-threaded.wasm','ort-wasm-simd-threaded.mjs']
    Promise.all(files.map(f=>fetch(base+'ort/'+f, { method:'HEAD' }).then(r=>r.ok).catch(()=>false)))
      .then(bools=>{
        const m: Record<string, boolean> = {}
        files.forEach((f,i)=>m[f]=bools[i])
        setPresent(m)
      })
  }, [])
  const okCount = Object.values(present).filter(Boolean).length
  return (
    <div className="border rounded-lg p-3">
      <div className="font-semibold mb-2">Diagnostics</div>
      <div>Cross-Origin Isolated: {coi? 'Yes':'No'} (Threads: {coi? 'multi':'1'})</div>
      <div>ORT Files ({okCount}/6)</div>
      <ul className="list-disc pl-5">
        {Object.entries(present).map(([k,v])=> <li key={k} className={v?'text-emerald-700':'text-red-600'}>{k} {v?'✓':'✗'}</li>)}
      </ul>
    </div>
  )
}
