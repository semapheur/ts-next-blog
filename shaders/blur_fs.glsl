uniform vec2 d0;
uniform vec2 d1;
uniform vec2 d2;
uniform vec2 d3;
varying vec2 vUv;
  
uniform sampler2D color_texture;
uniform vec2 uv_scale;
uniform float blur_amount;

vec4 customColorFunc(vec4 c) {
  return clamp(c, 0.0, 60000.0);
}

void main() {
  vec4 c = blur_amount * (
    customColorFunc(texture2D(color_texture, (vUv * uv_scale) + d0)) +
    customColorFunc(texture2D(color_texture, (vUv * uv_scale) + d1)) +
    customColorFunc(texture2D(color_texture, (vUv * uv_scale) + d2)) +
    customColorFunc(texture2D(color_texture, (vUv * uv_scale) + d3))
  );
  c.w = 1.0;
  gl_FragColor = c;
}