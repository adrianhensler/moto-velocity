export const waterfrontSprint1 = {
  id: 'waterfront',
  name: 'Track 2: Waterfront Sprint 1',
  length: 1040,
  background: 0x7fc9ff,
  fog: 0x9ed8ff,
  fogDensity: 0.0065,
  road: 0x4f5963,
  shoulder: 0xb8a58f,
  roadAt(s) {
    const a = (((s % this.length) + this.length) % this.length) / this.length * Math.PI * 2;
    return {
      x: Math.sin(a) * 31 + Math.sin(a * 2.6 - 0.4) * 9 + Math.sin(a * 4.0 + 1.7) * 3,
      y: Math.sin(a * 1.0 - 0.8) * 2.2 + Math.max(0, Math.sin(a * 2.0 + 1.1)) * 6.5 + Math.sin(a * 6.0) * 0.8,
      width: 9.2 + Math.sin(a * 2.0) * 0.8,
    };
  },
};
