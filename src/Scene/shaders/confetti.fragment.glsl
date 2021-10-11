#extension GL_OES_standard_derivatives : enable
precision mediump float;
uniform float uTime;
uniform float uSmooth;
uniform float uRotate;
uniform vec3 uColor;
varying float vRotate;

float box(in vec2 _st, in vec2 _size, in float delta){
  _size = vec2(0.5) - _size*0.5;
  vec2 uv = smoothstep(_size,
                      _size+vec2(delta),
                      _st);
  uv *= smoothstep(_size,
                  _size+vec2(delta),
                  vec2(1.0)-_st);
  return uv.x*uv.y;
}

mat2 rotate(in float angle) {
  return mat2(
      cos(angle), -sin(angle),
      sin(angle), cos(angle)
  );
}

void main() {
  vec2 st = gl_PointCoord;

  float tetha = distance(st, vec2(0.5) );
  float delta = fwidth(tetha);
  
  float rotateShift = smoothstep(1.0 - uSmooth, 1.0 + uSmooth, sin(uTime * 3.0) + 1.0) * uRotate;

  st -= 0.5;
  st = rotate(vRotate * 2.0 + rotateShift) * st;
  st += 0.5;
  
  float alpha = box(st, vec2(0.2, 0.9), delta);
  gl_FragColor = vec4( uColor, alpha);
}
