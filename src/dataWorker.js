// Generates chart data in per-line format: [{ x, y, name, lineGroupKey?, style }, ...]
// 500,000 points per line. X range 0-500000. Y range -5000 to 5000.
// Group 1: step 0.5. Group 2: alternating steps 0.3 and 0.7.
const POINTS_PER_LINE = 500_000
const X_MAX = 500_000
const Y_MIN = -5000
const Y_MAX = 5000
const step1 = 0.5
const step2a = 0.3
const step2b = 0.7

const seed = (s, i) => ((s * 7919 + i * 7877) % 100000) / 100000

function genY(n, seriesIdx, xArr) {
  const y = new Float64Array(n)
  let v = (Y_MIN + Y_MAX) / 2
  for (let i = 0; i < n; i++) {
    v += (seed(seriesIdx, i) - 0.5) * 80
    y[i] = Math.max(Y_MIN, Math.min(Y_MAX, v))
  }
  // Spikes: 10-20 per series
  const spikeCount = 10 + (seriesIdx % 11)
  for (let s = 0; s < spikeCount; s++) {
    const center = Math.floor(seed(seriesIdx, s * 13) * (n - 20)) + 10
    const width = 2 + Math.floor(seed(seriesIdx, s * 17) * 5)
    const amp = 500 + seed(seriesIdx, s * 19) * 1500
    const sign = seed(seriesIdx, s * 23) > 0.5 ? 1 : -1
    for (let w = 0; w < width && center + w < n; w++) {
      const idx = center + w
      y[idx] = Math.max(Y_MIN, Math.min(Y_MAX, y[idx] + sign * amp * (1 - w / width)))
    }
  }
  // Drops: 5-10 per series
  const dropCount = 5 + (seriesIdx % 6)
  for (let d = 0; d < dropCount; d++) {
    const start = Math.floor(seed(seriesIdx, d * 31 + 100) * (n - 100)) + 20
    const len = 30 + Math.floor(seed(seriesIdx, d * 37) * 70)
    const step = 200 + seed(seriesIdx, d * 41) * 800
    for (let i = 0; i < len && start + i < n; i++) {
      const ramp = i / len
      y[start + i] = Math.max(Y_MIN, y[start + i] - step * (1 - ramp))
    }
  }
  return y
}

self.onmessage = () => {
  const n = POINTS_PER_LINE
  // Group 1: x at 0.5 steps — 0, 0.5, 1, 1.5, ... 500k points, scale to 0-500000
  const x1 = new Float64Array(n)
  const x1Max = (n - 1) * step1
  for (let i = 0; i < n; i++) x1[i] = (i * step1 * X_MAX) / x1Max

  const group1 = Array.from({ length: 4 }, (_, s) => {
    const y = genY(n, s, x1)
    const xCopy = new Float64Array(x1)
    return {
      x: xCopy.buffer,
      y: y.buffer,
      name: `Group1-S${s}`,
      lineGroupKey: 'Group one',
      style: {
        bindable: true,
        ...(s === 2 && { thickness: 4 }),
        ...(s === 3 && { dash: { isDash: true, steps: [6, 4] } }),
      },
    }
  })

  // Group 2: x with alternating steps 0.3, 0.7, 0.3, 0.7, ... — 500k points, scale to 0-500000
  const x2 = new Float64Array(n)
  x2[0] = 0
  for (let i = 1; i < n; i++) {
    x2[i] = x2[i - 1] + (i % 2 === 1 ? step2a : step2b)
  }
  const x2Max = x2[n - 1]
  for (let i = 0; i < n; i++) x2[i] = (x2[i] * X_MAX) / x2Max

  const group2 = Array.from({ length: 6 }, (_, s) => {
    const y = genY(n, s + 4, x2)
    const xCopy = new Float64Array(x2)
    return {
      x: xCopy.buffer,
      y: y.buffer,
      name: `Group2-S${s}`,
      lineGroupKey: 'Group two',
      style: { bindable: false },
    }
  })

  const lines = [...group1, ...group2]
  const transferables = lines.flatMap((l) => [l.x, l.y])
  self.postMessage({ lines }, transferables)
}
