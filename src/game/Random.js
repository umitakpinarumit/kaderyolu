// Basit tohumlu RNG (mulberry32)
export function createRng(seedNumber) {
  let t = seedNumber >>> 0;
  return function rng() {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function randomClamped(rng, mean = 50, spread = 20, min = 20, max = 85) {
  // Üç rastgelein ortalaması ile yaklaşık normal dağılım
  const v = (rng() + rng() + rng()) / 3;
  const val = Math.round(mean + (v - 0.5) * spread * 2);
  return Math.max(min, Math.min(max, val));
}

