import gsap from "gsap";

import { Scene, Color, PerspectiveCamera } from "three";

import Device from "@/core/Device";

import Renderer from "./Renderer";

import Confettis from "./Confettis";
import Glyph from "./Glyph/index.js";

import { Pane } from "tweakpane";

export default class {
  components = {};
  scene = new Scene();
  camera = new PerspectiveCamera(75, Device.width / Device.height, 0.1, 1000);

  constructor(canvas) {
    this.canvas = canvas;
    this.camera.position.z = 5;

    this.scene.background = new Color(0x0d3a6e);

    this.renderer = new Renderer(canvas);

    this.setDebug();

    this.components.confettis = new Confettis({
      scene: this.scene,
      debug: this.debug,
    });

    this.components.title = new Glyph({
      scene: this.scene,
      caption: "Creative Developer\nat PlayPlay",
      fontSize: 120,
      debug: this.debug,
    });

    this.boundHandleResize = this.handleResize.bind(this);
    this.boundHandleResize();

    this.boundHandleRender = this.handleRender.bind(this);
    gsap.ticker.add(this.boundHandleRender);
    window.addEventListener("resize", this.boundHandleResize);
  }
  setDebug() {
    this.debug = new Pane();
    this.debug.containerElem_.style.width = "320px";
    const PARAMS = {
      smooth: false,
      message: "Creative Developer\\nat PlayPlay",
      fps: 60,
    };

    this.debugFolder = this.debug.addFolder({
      title: "global",
    });

    {
      this.debugFolder.addInput(PARAMS, "message").on("change", (e) => {
        const regex = /\\n/i;
        const str = e.value.replace(regex, "\n");
        console.log(str);
        this.components.title.updateCaption(str);
      });

      this.debugFolder.addInput(PARAMS, "smooth").on("change", (e) => {
        if (this.components.confettis) {
          this.components.confettis.material.uniforms.uSmooth.value =
            e.value == true ? 0.25 : 0.0;
          this.components.title.material.uniforms.uSmooth.value =
            e.value == true ? 1.0 : 0.5;
          this.components.title.textShadow.material.uniforms.uSmooth.value =
            e.value == true ? 1.0 : 0.5;
        }
        this.fpsIndex.hidden = !e.value;
        gsap.ticker.fps(e.value ? PARAMS.fps : 60);
      });
      this.fpsIndex = this.debugFolder
        .addInput(PARAMS, "fps", { label: "fps", min: 1, max: 60, step: 1 })
        .on("change", (e) => {
          gsap.ticker.fps(e.value);
        });
      this.fpsIndex.hidden = true;
    }
  }
  getFovHeigth(distance) {
    const vFOV = (this.camera.fov * Math.PI) / 180;
    const minY = 2 * Math.tan(vFOV / 2) * distance;
    return minY;
  }
  handleRender(time, deltaTime) {
    Object.keys(this.components).forEach((_) => {
      this.components[_].handleRender(time, deltaTime);
    });
    this.renderer.handleRender(this.scene, this.camera);
  }
  handleResize() {
    const { sizes } = Device;

    const width = window.innerWidth;
    const height = window.innerHeight;

    Device.width = width;
    Device.height = height;

    sizes.halfWidth = Device.width * 0.5;
    sizes.halfHeight = Device.height * 0.5;

    sizes.frustum.height = this.getFovHeigth(this.camera.position.z);
    sizes.frustum.width = sizes.frustum.height * this.camera.aspect;
    const scaleTexel = Math.min(1.0, window.innerWidth / 1920);
    sizes.absoluteTexel = sizes.frustum.width / Device.width;
    sizes.texel = sizes.absoluteTexel * scaleTexel;

    this.camera.aspect = Device.width / Device.height;
    this.camera.updateProjectionMatrix();

    Object.keys(this.components).forEach((_) => {
      this.components[_].handleResize();
    });

    this.renderer.handleResize();
  }
}
