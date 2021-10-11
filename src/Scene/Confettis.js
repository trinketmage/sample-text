import Component from "./helpers/Component";
import PointsFactory from "./helpers/PointsFactory";

import {
  RawShaderMaterial,
  NormalBlending as AdditiveBlending,
  Color,
} from "three";

import fragmentShader from "./shaders/confetti.fragment.glsl";
import vertexShader from "./shaders/confetti.vertex.glsl";

class Confettis extends Component {
  constructor({ scene, debug }) {
    super();

    this.material = new RawShaderMaterial({
      transparent: true,
      uniforms: {
        uColor: {
          value: new Color(0x6cbdb0),
        },
        uTime: {
          value: 0.0,
        },
        uSmooth: {
          value: 0.0,
        },
        uRotate: {
          value: 0.25
        },
        uSize: {
          value: 50.0,
        },
      },
      blending: AdditiveBlending,
      vertexShader,
      fragmentShader,
    });
    this.points = new PointsFactory({
      scene,
      material: this.material,
      separation: 1,
    });
    this.mesh = this.points.mesh;
    
    this.setDebug(debug);
  }
  setDebug(debug) {
    if (undefined === debug) return;
    this.debugFolder = debug.addFolder({
      title: 'background'
    });
    {
      this.debugFolder
        .addInput(
          this.material.uniforms.uRotate,
          'value',
          { label: 'rotate', min: 0, max: 3.14, step: 0.01 }
        )
    }
  }
  handleRender(time) {
    this.mesh.material.uniforms.uTime.value = time * 1.0;
  }
  handleResize() {}
}

export default Confettis;
