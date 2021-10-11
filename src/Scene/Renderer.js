import {
  WebGL1Renderer as WebGLRenderer,
  sRGBEncoding,
  ACESFilmicToneMapping,
} from "three";

import Device from "@/core/Device";

class Renderer {
  constructor(el) {
    this.renderer = new WebGLRenderer({
      canvas: el,
      alpha: false,
      stencil: false,
      depth: false,
      powerPreference: "high-performance",
      antialias: false,
    });
    this.renderer.setSize(Device.width, Device.height);

    this.renderer.physicallyCorrectLights = true;
    this.renderer.toneMapping = ACESFilmicToneMapping;
    this.renderer.outputEncoding = sRGBEncoding;

    this.renderer.setPixelRatio(Device.pixelRatio);
    this.renderer.autoClear = false;
  }
  handleRender(scene, camera) {
    this.renderer.render(scene, camera);
  }
  handleResize() {
    this.renderer.setSize(Device.width, Device.height);
  }
}

export default Renderer;
