#extension GL_OES_standard_derivatives : enable

precision highp float;

uniform float opacity;
uniform float time;
uniform float paper;
uniform vec3 color;
uniform sampler2D map;

varying float lerp;
varying vec2 vGuv;

float median(float r, float g, float b) {
  return max(min(r, g), min(max(r, g), b));
}

vec3 random3(vec3 c) {
    float j = 4096.0*sin(dot(c,vec3(17.0, 59.4, 15.0)));
    vec3 r;
    r.z = fract(512.0*j);
    j *= .125;
    r.x = fract(512.0*j);
    j *= .125;
    r.y = fract(512.0*j);
    return r-0.5;
}

const float F3 =  0.3333333;
const float G3 =  0.1666667;
float snoise(vec3 p) {

    vec3 s = floor(p + dot(p, vec3(F3)));
    vec3 x = p - s + dot(s, vec3(G3));

    vec3 e = step(vec3(0.0), x - x.yzx);
    vec3 i1 = e*(1.0 - e.zxy);
    vec3 i2 = 1.0 - e.zxy*(1.0 - e);

    vec3 x1 = x - i1 + G3;
    vec3 x2 = x - i2 + 2.0*G3;
    vec3 x3 = x - 1.0 + 3.0*G3;

    vec4 w, d;

    w.x = dot(x, x);
    w.y = dot(x1, x1);
    w.z = dot(x2, x2);
    w.w = dot(x3, x3);

    w = max(0.6 - w, 0.0);

    d.x = dot(random3(s), x);
    d.y = dot(random3(s + i1), x1);
    d.z = dot(random3(s + i2), x2);
    d.w = dot(random3(s + 1.0), x3);

    w *= w;
    w *= w;
    d *= w;

    return dot(d, vec4(52.0));
}
void main() {
  vec2 fontUv = vGuv;
  
  vec3 s = texture2D(map, fontUv).rgb;
  float sigDist = median(s.r, s.g, s.b) - 0.5;

  float term = snoise(vec3(fontUv*150.,time))*0.003;
  term = mix(0.0, (step(0.0,term) * fwidth(sigDist)), paper);

  float alpha = clamp(sigDist/fwidth(sigDist) + 0.5, 0.0, 1.0);

  gl_FragColor = vec4(color.rgb, (alpha - term) * opacity * lerp);
  if (gl_FragColor.a < 0.0001) discard;
}