import React, { useEffect, useRef, useState } from 'react'
import UploadArea from '@/components/UploadArea'
import Cropper from '@/components/Cropper'
import BGPicker from '@/components/BGPicker'
import ExportBar from '@/components/ExportBar'
import ProgressBar from '@/components/ProgressBar'
import Diagnostics from '@/components/Diagnostics'
import { useAppState } from '@/state/useAppState'

export default function App(){
  const { cropped, set, status } = useAppState()
  const [alphaPreviewUrl, setAlphaPreviewUrl] = useState<string>('')

  async function runMatting(){
    if (!cropped) return
    set({ status: 'processing', error: undefined })
    const worker = new Worker(new URL('../workers/inference.worker.ts', import.meta.url), { type: 'module' })
    const bmp = await createImageBitmap(cropped)
    worker.onmessage = (ev: MessageEvent) => {
      const msg = ev.data
      if (msg.type === 'ALPHA_DONE') {
        set({ alpha: msg.payload, status: 'ready' })
        // build preview
        const c = document.createElement('canvas')
        c.width = msg.payload.width; c.height = msg.payload.height
        c.getContext('2d')!.putImageData(msg.payload, 0, 0)
        setAlphaPreviewUrl(c.toDataURL())
        worker.terminate()
      } else if (msg.type === 'ERROR') {
        set({ status: 'error', error: msg.error })
        worker.terminate()
      }
    }
    worker.postMessage({ type: 'RUN_MATTING', payload: bmp }, [bmp])
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">CV-Photo Studio</h1>
        <div className="text-sm text-gray-500">MVP – offline, lokal</div>
      </header>

      <section>
        <h2 className="font-semibold mb-2">1) Upload</h2>
        <UploadArea />
      </section>

      <section>
        <h2 className="font-semibold mb-2">2) Zuschneiden</h2>
        <Cropper />
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">3) Freistellen</h2>
        <button className="px-4 py-2 rounded bg-indigo-600 text-white" onClick={runMatting} disabled={!cropped || status==='processing'}>Hintergrund entfernen</button>
        {alphaPreviewUrl && <img src={alphaPreviewUrl} alt="Alpha Preview" className="max-w-full border rounded" />}
        <ProgressBar />
      </section>

      <section>
        <h2 className="font-semibold mb-2">4) Hintergrund</h2>
        <BGPicker />
      </section>

      <section>
        <h2 className="font-semibold mb-2">5) Export</h2>
        <ExportBar />
      </section>

      <section>
        <Diagnostics />
      </section>
    </div>
  )
}
