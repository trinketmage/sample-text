precision mediump float;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;

uniform float uSize;

attribute float rotation;
attribute vec3 position;

varying float vRotate;

void main() {
  vRotate = rotation;

  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );

  gl_PointSize = uSize;

  gl_Position = projectionMatrix * mvPosition;
}