varying vec2 vUv;
uniform sampler2D color_texture;
uniform vec3 color_multiplier;
uniform vec2 uv_scale;

void main() {
  vec4 c = texture2D(color_texture, vUv * uv_scale) * vec4(color_multiplier, 1.0);
  gl_FragColor = vec4(c.rgb, 1.0);
}