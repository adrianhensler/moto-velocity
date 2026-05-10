export const desertTest1 = {
  id: 'desert',
  name: 'Track 1: Desert Test 1',
  length: 900,
  background: 0xf2a35e,
  fog: 0xf2a35e,
  fogDensity: 0.009,
  road: 0x7e4229,
  shoulder: 0xd88b45,
  roadAt(s) {
    const a = (((s % this.length) + this.length) % this.length) / this.length * Math.PI * 2;
    return {
      x: Math.sin(a) * 25 + Math.sin(a * 2.0 + 0.7) * 13 + Math.sin(a * 5.0) * 4.5,
      y: Math.sin(a * 2.0 - 0.4) * 8.5 + Math.sin(a * 5.0 + 1.2) * 2.2,
      width: 10.2 + Math.sin(a * 3.0) * 1.0,
    };
  },
};
