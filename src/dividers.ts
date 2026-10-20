type EllipseRect = { left: number; top: number; width: number; height: number }
type DividerRect = { left: number; right: number; bottom: number }

// All bounds use viewport coordinates. An explicit right limit lets the line reach
// the arc beyond the content column while remaining inside the viewport.
export function clipDivider(surface: EllipseRect, row: DividerRect, rightLimit = row.right): { start: number; width: number } {
  if (surface.width <= 0 || surface.height <= 0) return { start: 0, width: 0 }
  const rx = surface.width / 2
  const ry = surface.height / 2
  const cx = surface.left + rx
  const cy = surface.top + ry
  const normalizedY = (row.bottom - cy) / ry
  if (Math.abs(normalizedY) > 1) return { start: 0, width: 0 }
  const extent = rx * Math.sqrt(Math.max(0, 1 - normalizedY ** 2))
  const left = Math.max(row.left, cx - extent)
  const right = Math.min(rightLimit, cx + extent)
  return { start: Math.max(0, left - row.left), width: Math.max(0, right - left) }
}

type CachedDivider = {
  line: HTMLElement
  left: number
  right: number
  bottom: number
  start?: string
  width?: string
}

// Read layout only after content or viewport changes. Scrolling then uses the
// cached document positions and writes only to visible, isolated line elements.
export function createDividerRenderer() {
  let surface: EllipseRect | undefined
  let rows: CachedDivider[] = []
  let rightLimit = 0

  return {
    measure(plane: HTMLElement | undefined, container: HTMLElement | undefined, scrollY: number, viewportWidth: number) {
      rows = []
      surface = undefined
      if (!plane || !container) return
      const bounds = plane.getBoundingClientRect()
      if (bounds.width <= 0 || bounds.height <= 0) return
      surface = { left: bounds.left, top: bounds.top, width: bounds.width, height: bounds.height }
      rightLimit = viewportWidth
      for (const row of Array.from(container.querySelectorAll<HTMLElement>('[data-divider]'))) {
        const line = row.querySelector<HTMLElement>(':scope > .section-divider')
        if (!line) continue
        const rect = row.getBoundingClientRect()
        rows.push({ line, left: rect.left, right: rect.right, bottom: rect.bottom + scrollY })
      }
    },
    render(scrollY: number, viewportHeight: number) {
      if (!surface) return
      for (const row of rows) {
        const bottom = row.bottom - scrollY
        if (bottom < 0 || bottom > viewportHeight) continue
        const clipped = clipDivider(surface, { left: row.left, right: row.right, bottom }, rightLimit)
        const start = `${clipped.start}px`
        const width = `${clipped.width}px`
        if (row.start !== start) {
          row.line.style.setProperty('--divider-start', start)
          row.start = start
        }
        if (row.width !== width) {
          row.line.style.setProperty('--divider-width', width)
          row.width = width
        }
      }
    }
  }
}
