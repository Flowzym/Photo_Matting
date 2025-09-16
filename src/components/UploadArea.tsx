import React from 'react'
import { useAppState } from '@/state/useAppState'
import { getOrientation } from '@/utils/exif'
import { loadImageFromFile, drawImageWithRotationToCanvas } from '@/utils/image'

export default function UploadArea(){
  const set = useAppState(s=>s.set)
  async function onFiles(files: FileList|null){
    if (!files || !files[0]) return
    const file = files[0]
    const img = await loadImageFromFile(file)
    const ori = await getOrientation(file)
    const canvas = drawImageWithRotationToCanvas(img, ori, 2048)
    set({ image: img, cropped: canvas, status: 'ready' })
  }
  function onDrop(e: React.DragEvent){
    e.preventDefault(); onFiles(e.dataTransfer.files)
  }
  return (
    <div className="border-2 border-dashed rounded-xl p-6 text-center bg-gray-50"
         onDragOver={e=>e.preventDefault()} onDrop={onDrop}>
      <p className="mb-3">Bild hierher ziehen oder auswählen</p>
      <input type="file" accept="image/png,image/jpeg,image/webp"
        onChange={e=>onFiles(e.currentTarget.files)} />
    </div>
  )
}
