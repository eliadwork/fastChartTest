// Generates x (shared) + one y Float64Array per series.
// Injects spikes, oscillation bursts, and sudden drops so anomalies pop out.
// All buffers are transferred zero-copy to the main thread.
self.onmessage = ({ data: { count, seriesCount } }) => {
  const x = new Float64Array(count);
  for (let i = 0; i < count; i++) x[i] = i;

  const ys = Array.from({ length: seriesCount }, (_, seriesIdx) => {
    const buf = new Float64Array(count);
    let y = Math.random() * 1000;
    for (let i = 0; i < count; i++) {
      y += (Math.random() - 0.5) * 20;
      buf[i] = y;
    }

    // Deterministic seed for reproducible placement per series
    const seed = (i) => ((seriesIdx * 7919 + i * 7877) % 100000) / 100000;

    // 1. Spikes: 5-10 per series, 1-3 pts wide, amplitude 50-150
    const spikeCount = 5 + (seriesIdx % 6);
    for (let s = 0; s < spikeCount; s++) {
      const center = Math.floor(seed(s * 13) * (count - 10)) + 5;
      const width = 1 + Math.floor(seed(s * 17) * 3);
      const amp = 50 + seed(s * 19) * 100;
      const sign = seed(s * 23) > 0.5 ? 1 : -1;
      for (let w = 0; w < width && center + w < count; w++) {
        buf[center + w] += sign * amp * (1 - w / Math.max(width, 1));
      }
    }

    // 2. Oscillation bursts: 3-5 per series, 50-150 pts, amplitude 30-80
    const burstCount = 3 + (seriesIdx % 3);
    for (let b = 0; b < burstCount; b++) {
      const start = Math.floor(seed(b * 31 + 100) * (count - 200)) + 50;
      const len = 50 + Math.floor(seed(b * 37 + 200) * 100);
      const amp = 30 + seed(b * 41 + 300) * 50;
      const cycles = 3 + Math.floor(seed(b * 43 + 400) * 5);
      for (let i = 0; i < len && start + i < count; i++) {
        buf[start + i] += amp * Math.sin((2 * Math.PI * cycles * i) / len);
      }
    }

    // 3. Sudden drops: 1-2 per series, step 100-300, recover over 20-50 pts
    const dropCount = 1 + (seriesIdx % 2);
    for (let d = 0; d < dropCount; d++) {
      const start = Math.floor(seed(d * 47 + 500) * (count - 100)) + 25;
      const step = 100 + seed(d * 53 + 600) * 200;
      const recoverLen = 20 + Math.floor(seed(d * 59 + 700) * 30);
      for (let i = 0; i < recoverLen && start + i < count; i++) {
        const ramp = i / recoverLen;
        buf[start + i] -= step * (1 - ramp);
      }
    }

    return buf;
  });

  const transferables = [x.buffer, ...ys.map((a) => a.buffer)];
  self.postMessage({ x: x.buffer, ys: ys.map((a) => a.buffer) }, transferables);
};
