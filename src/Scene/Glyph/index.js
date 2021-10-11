import {
  Vector2,
  Mesh,
  Object3D,
  Uniform,
  Color,
  RawShaderMaterial,
} from "three";

import gsap from "gsap";

import vertexShader from "@/Scene/Glyph/shaders/vertex.glsl";
import fragmentShader from "@/Scene/Glyph/shaders/fragment.glsl";
import createGeometry from "./glFont";

import regular from "@/assets/Roboto-Black.json";

import Device from "@/core/Device";

const fonts = {
  regular
};

import assets from "@/Scene/Assets";

const textures = assets.fonts;

export default class Glyph {
  PARAMS = {
    progress: 0,
    yoyo: true,
    paused: false
  };
  constructor({
    scene,
    caption = "BUTTON",
    weight = "regular",
    fontSize = 270,
    align = "center",
    verticalAlign = "middle",
    lineHeight = 0.873,
    letterSpacing = -0.03,
    width = undefined,
    position = new Vector2(0.0, 0.0),
    offset = new Vector2(0.0, 0.0),
    color = 0xffffff,
    mobile = null,
    debug
  }) {
    // this.material = material;
    this.scene = scene;
    this.fontSize = fontSize;
    this.caption = caption;
    this.align = align;
    this.verticalAlign = verticalAlign;
    this.position = position;
    this.offset = offset;
    this.width = width;

    this.mobile = mobile;

    this.font = fonts[weight];

    this.geometry = new createGeometry({
      text: caption,
      font: fonts.regular,
      align,
      width,
      flipY: 0,
      letterSpacing: this.font.info.size * letterSpacing,
      lineHeight: this.font.info.size * lineHeight
    });

    this.scale = 1.0;
    this.total = this.geometry.total;

    this.interpolate = {
      x: 0
    };

    this.mdsf = {
      transparent: true,
      uniforms: {
        opacity: new Uniform(1),
        time: new Uniform(0.0),
        stagger: new Uniform(0.1),
        direction: new Uniform(0.0),
        paper: new Uniform(1.0),
        duration: new Uniform(0.2),
        map: new Uniform(textures[weight]),
        color: { type: "c", value: new Color(color) },
        resolution: { type: "c", value: new Vector2(0, 0) },
        mixRatio: new Uniform(0),
        total: new Uniform(this.total),
        uSmooth: new Uniform(0.5)
      },
      vertexShader,
      fragmentShader,
      depthTest: true
    };
    this.material = new RawShaderMaterial(this.mdsf);

    this.layout = this.geometry.layout;
    this.text = new Mesh(this.geometry, this.material);
    this.text.renderOrder = 3;
    // this.text.geometry.computeBoundingBox();

    this.text.matrixAutoUpdate = false;
    this.group = new Object3D();
    this.group.matrixAutoUpdate = false;
    this.textAnchor = new Object3D();
    this.textAnchor.matrixAutoUpdate = false;

    this.textShadow = this.text.clone();
    this.textShadow.material = this.text.material.clone();
    this.textShadow.material.uniforms.map.value = textures[weight];
    this.textShadow.material.uniforms.color.value = new Color(0x6cbdb0);
    this.textShadow.renderOrder = 2;
    // this.textShadow.material = new RawShaderMaterial(this.mdsf);
    
    this.textAnchor.add(this.textShadow);
    this.textAnchor.add(this.text);

    this.group.add(this.textAnchor);
    this.scene.add(this.group);


    this.interpolate = {
      x: 0,
      y: 0,
    };
    this.tl = new gsap.timeline({
      id: "Love",
      paused: true
      // repeat: -1,
      // yoyo: true
    });
    this.tweenShadow = gsap.to(this.interpolate, {
      duration: 1,
      y: 1,
      ease: "none",
      onUpdate: () => {
        this.textShadow.material.uniforms.mixRatio.value = this.interpolate.y;
      }
    });
    this.tl.add(this.tweenShadow, "a");
    this.tween = gsap.to(this.interpolate, {
      delay: 0.1,
      duration: 1,
      x: 1,
      ease: "none",
      onUpdate: () => {
        this.material.uniforms.mixRatio.value = this.interpolate.x;
      }
    });
    this.tl.add(this.tween, "a");

    this.setDebug(debug);

    this.animation = new gsap.timeline({
      repeat: -1,
      yoyo: true
    });
    this.animation.to(this.PARAMS, {
      progress: 1,
      duration: this.tl.duration(),
      onUpdate: () => {
        this.progressInput.refresh();
      }
    });
    this.updateDuration();
  }
  updateDuration() {
    const extent = parseFloat(this.material.uniforms.duration.value) + parseFloat(this.material.uniforms.stagger.value) * this.total;
    console.log(this.total, extent);
    this.animation.duration(extent);
  }
  setDebug(debug) {
    if (undefined === debug) return;
    this.debugFolder = debug.addFolder({
      title: 'glyph'
    });
    {
      this.debugFolder.addInput(this.PARAMS, "yoyo").on("change", (e) => {
        this.animation.yoyo(e.value);
      });
      this.debugFolder.addInput(this.PARAMS, "paused").on("change", (e) => {
        if (!e.value) {
          this.animation.play();
        } else {
          this.animation.pause();
        }
      });
      this.progressInput = this.debugFolder
        .addInput(
          this.PARAMS,
          'progress',
          { label: 'timeline', min: 0, max: 1, step: 0.01 }
        )
        .on('change', (e) => {
          this.tl.render(e.value * this.tl.duration());
        });
        this.debugFolder
          .addInput(
            this.material.uniforms.duration,
            'value',
            { label: 'duration', min: 0, max: 2, step: 0.01 }
          )
          .on('change', (e) => {
            this.textShadow.material.uniforms.duration.value = e.value;
            this.updateDuration();
          });
        this.debugFolder
          .addInput(
            this.material.uniforms.stagger,
            'value',
            { label: 'stagger', min: 0, max: 2, step: 0.01 }
          )
          .on('change', (e) => {
            this.textShadow.material.uniforms.stagger.value = e.value;
            this.updateDuration();
          });
        this.debugFolder
          .addInput(
            this.material.uniforms.paper,
            'value',
            { label: 'paper', min: 0, max: 1, step: 0.01 }
          )
          .on('change', (e) => {
            this.textShadow.material.uniforms.paper.value = e.value;
          });
    }
  }
  updateCaption(text) {
    this.caption = text;
    this.geometry.update({
      text
    });
    this.total = this.geometry.total;
    this.material.uniforms.total.value = this.total;
    this.handleResize();
  }
  updateSize(fontSize) {
    this.fontSize = fontSize;
    this.handleResize();
  }
  enter() {
    const { interpolate } = this;
    interpolate.x = this.material.uniforms.opacity.value;
    return gsap.to(interpolate, {
      overwrite: "auto",
      x: 1.0,
      duration: 1.0 + this.total * 0.0125,
      ease: "sine.inOut",
      onUpdate: () => {
        this.material.uniforms.opacity.value = interpolate.x;
      }
    });
  }
  leave(duration) {
    const { interpolate } = this;
    interpolate.x = this.material.uniforms.opacity.value;
    return gsap.to(interpolate, {
      overwrite: "auto",
      x: 0.0,
      duration: duration || 1.0 + this.total * (0.0125 / this.total),
      ease: "sine.in",
      onUpdate: () => {
        this.material.uniforms.opacity.value = interpolate.x;
      }
    });
  }
  handleRender(t) {
    this.material.uniforms.time.value = t;
    this.textShadow.material.uniforms.time.value = t + 1.05;
  }
  handleResize() {
    const { sizes } = Device;
    let texel = sizes.texel;
    const absoluteTexel = sizes.absoluteTexel;
    this.scale = (texel / this.font.info.size) * this.fontSize;

    const attrs = {};
    let { position, offset, align } = this;

    if (Device.width < 768 && this.mobile) {
      const fontSize = this.mobile?.fontSize || this.fontSize;
      this.scale = (absoluteTexel / this.font.info.size) * fontSize;
      if (this.mobile.caption && this.geometry.text !== this.mobile.caption) {
        attrs.text = this.mobile.caption;
      }
      if (
        this.mobile.width &&
        this.geometry.layout.width !== this.mobile.width
      ) {
        attrs.width = this.mobile.width;
      }
      if ("offset" in this.mobile) {
        offset = this.mobile.offset;
      }
      if ("position" in this.mobile) {
        position = this.mobile.position;
      }
      if ("align" in this.mobile) {
        align = this.mobile.align;
        attrs.align = this.mobile.align;
      }
      this.geometry.update(attrs);
      texel = absoluteTexel;
    } else {
      if (this.geometry.text !== this.caption) {
        this.geometry.update({
          text: this.caption,
          // align: this.align
        });
        if (this.width && this.geometry.layout.width !== this.width) {
          this.geometry.update({
            width: this.width
          });
        }
      }
    }

    this.text.geometry.computeBoundingBox();
    this.text.scale.x = this.scale;
    this.text.scale.y = this.scale;
    this.text.rotation.x = Math.PI;
    this.text.updateMatrix();

    this.textShadow.geometry.computeBoundingBox();
    this.textShadow.scale.x = this.scale;
    this.textShadow.scale.y = this.scale;
    this.textShadow.rotation.x = Math.PI;
    this.textShadow.updateMatrix();

    // const margin = texel * 80;
    if (align === "center") {
      this.group.position.x =
        (-this.text.geometry.boundingBox.max.x +
          this.text.geometry.boundingBox.min.x) *
        0.5 *
        this.scale;
    } else if (align === "left") {
      this.group.position.x = 0;
    } else if (align === "right") {
      this.group.position.x =
        (-this.text.geometry.boundingBox.max.x +
          this.text.geometry.boundingBox.min.x) *
        this.scale;
    }

    if (this.verticalAlign === "bottom") {
      this.group.position.y =
        (-this.text.geometry.boundingBox.max.y +
          this.text.geometry.boundingBox.min.y) *
        this.scale;
    } else if (this.verticalAlign === "top") {
      this.group.position.y = 0;
    } else {
      this.group.position.y =
        (-this.text.geometry.boundingBox.max.y +
          this.text.geometry.boundingBox.min.y) *
        0.5 *
        this.scale;
    }
    this.group.position.x +=
      offset.x * texel + position.x * sizes.frustum.width;
    this.group.position.y +=
      offset.y * texel + position.y * sizes.frustum.height;
    this.group.updateMatrix();
  }
  dispose() {
    this.scene.remove(this.group);
    this.geometry.dispose();
    this.material.dispose();
  }
}
