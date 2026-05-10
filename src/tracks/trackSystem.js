import { desertTest1 } from './desertTest1.js';
import { waterfrontSprint1 } from './waterfrontSprint1.js';

export class TrackSystem {
  constructor(scene, materials, trackNameElement) {
    this.scene = scene;
    this.materials = materials;
    this.trackNameElement = trackNameElement;
    this.tracks = [desertTest1, waterfrontSprint1];
    this.activeTrack = this.tracks[0];
  }

  setTrack(index) {
    this.activeTrack = this.tracks[index] ?? this.tracks[0];
    this.scene.background.setHex(this.activeTrack.background);
    this.scene.fog.color.setHex(this.activeTrack.fog);
    this.scene.fog.density = this.activeTrack.fogDensity;
    this.materials.road.color.setHex(this.activeTrack.road);
    this.materials.sand.color.setHex(this.activeTrack.shoulder);
    this.trackNameElement.textContent = `${this.activeTrack.name} · press 1/2 to switch`;

    this.scene.traverse(object => {
      if (object.userData?.theme) object.visible = object.userData.theme === this.activeTrack.id;
    });
  }

  roadAt(s) {
    return this.activeTrack.roadAt(s);
  }

  tangentAt(s) {
    const p0 = this.roadAt(s - 2);
    const p1 = this.roadAt(s + 2);
    return { dx: (p1.x - p0.x) / 4, dy: (p1.y - p0.y) / 4 };
  }
}
