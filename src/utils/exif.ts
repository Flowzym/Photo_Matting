import exifr from 'exifr'

export async function getOrientation(file: File): Promise<number|undefined> {
  try {
    const meta = await exifr.parse(file, { translateValues: false })
    return (meta as any)?.Orientation
  } catch {
    return undefined
  }
}
