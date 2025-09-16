import { create } from 'zustand'

export type Background =
  | { type: 'color'; color: string }
  | { type: 'gradient'; from: string; to: string; angle: number }
  | { type: 'image'; file?: File; fit: 'contain'|'cover'; blur: number }
  | { type: 'pattern'; kind: 'stripes'|'dots'|'grid' }

type Status = 'idle'|'loading'|'ready'|'error'|'processing'

export interface AppState {
  image?: HTMLImageElement
  cropped?: HTMLCanvasElement
  alpha?: ImageData
  background: Background
  roundMask: boolean
  exportFormat: 'png'|'jpg'
  exportSize: 'original'|'1024'|'2048'
  status: Status
  error?: string
  set: (partial: Partial<AppState>) => void
  reset: () => void
}

export const useAppState = create<AppState>((set) => ({
  image: undefined,
  cropped: undefined,
  alpha: undefined,
  background: { type: 'color', color: '#ffffff' },
  roundMask: false,
  exportFormat: 'png',
  exportSize: 'original',
  status: 'idle',
  set: (partial) => set(partial),
  reset: () => set({
    image: undefined, cropped: undefined, alpha: undefined,
    background: { type: 'color', color: '#ffffff' },
    roundMask: false, exportFormat: 'png', exportSize: 'original',
    status: 'idle', error: undefined
  })
}))
