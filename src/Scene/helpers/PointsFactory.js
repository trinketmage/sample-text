import {
  BufferGeometry,
  BufferAttribute,
  Points,
} from "three";

class PointsFactory {
  separation = 5;
  x = 32;
  y = 32;

  constructor({ scene, material, separation }) {
    if (separation) {
      this.separation = separation
    }
    const numParticles = this.x * this.y;

    const positions = new Float32Array(numParticles * 3);
    const scales = new Float32Array(numParticles);
    const rotations = new Float32Array(numParticles);

    let i = 0,
      j = 0;

    for (let ix = 0; ix < this.x; ix++) {
      for (let iy = 0; iy < this.y; iy++) {
        positions[i] = (Math.random() - 0.5) * 2.0 * 40.;
        positions[i + 1] = (Math.random() - 0.5) * 40.;
        positions[i + 2] = 0;

        scales[j] = 1;
        rotations[j] = Math.random();

        i += 3;
        j++;
      }
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    geometry.setAttribute("scale", new BufferAttribute(scales, 1));
    geometry.setAttribute("rotation", new BufferAttribute(rotations, 1));

    this.material = material;

    this.mesh = new Points(geometry, this.material);
    // this.mesh.matrixAutoUpdate = false;
    // this.mesh.frustumCulled = false;
    scene.add(this.mesh);
  }
}

export default PointsFactory;
