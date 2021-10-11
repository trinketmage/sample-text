attribute float index;
attribute float weight;
attribute vec2 guv;
attribute vec4 position;
uniform float time;
uniform float mixRatio;
uniform float total;
uniform float duration;
uniform float direction;
uniform float stagger;
uniform float uSmooth;
uniform mat4 projectionMatrix;
uniform mat4 modelViewMatrix;

varying float lerp;
varying vec2 vGuv;

void main() {
  float vIdx = index;
  vGuv = guv;

  float staggers = (total * stagger);
  float totalDuration = duration + weight * stagger;
  
  float maxDuration = totalDuration + staggers;
  float space = totalDuration / maxDuration;

  float offset = (mix(vIdx, (total - vIdx), direction) * stagger) / maxDuration;

	lerp = smoothstep(offset, offset + space, mixRatio);
  
  vec4 mvPosition = projectionMatrix * modelViewMatrix * position;
  float inv = 1.0 / uSmooth;
  float wave = mix(floor(time * inv) / inv, time, uSmooth);
  mvPosition += sin(mvPosition.x * 1.25 + wave) * 0.03125;
  gl_Position = mvPosition;
}
