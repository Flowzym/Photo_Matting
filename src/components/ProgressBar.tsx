import React from 'react'
import { useAppState } from '@/state/useAppState'

export default function ProgressBar(){
  const { status, error } = useAppState()
  return (
    <div className="text-sm">
      <span className="font-medium">Status:</span> {status}
      {error && <div className="text-red-600 mt-1">{error}</div>}
    </div>
  )
}
