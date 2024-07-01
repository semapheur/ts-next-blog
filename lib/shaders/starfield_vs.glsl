#ifdef GL_FRAGMENT_PRECISION_HIGH
  precision highp float;
#else
  precision mediump float;
#endif

attribute vec4 my_position;

uniform vec3 offset;
uniform float brightness_scale;
uniform vec3 velocity;

uniform vec3 frac_cam_pos;
uniform mat4 lorentz;

vec3 blackbody_radiation(float t) {
    const float t_white = 6000.0;
    const float b_r = 22135.0;
    const float b_g = 26159.0;
    const float b_b = 31972.0;
    const float a_r = exp(b_r / 6000.0) - 1.0;
    const float a_g = exp(b_g / 6000.0) - 1.0;
    const float a_b = exp(b_b / 6000.0) - 1.0;
    return vec3(a_r / (exp(b_r / t) - 1.0), a_g / (exp(b_g / t) - 1.0), a_b / (exp(b_b / t) - 1.0));
}

const mat3 random_rotate_1 = mat3(
  -0.449494, -0.336526, -0.827469,
  0.890225, -0.0921674, -0.4461,
  0.0738586, -0.937153, 0.341013
);
vec3 rand3(vec4 co){
  return fract(sin(random_rotate_1 * co.xyz + vec3(co.w * 200.0, 0.0, 0.0)) * 43758.5453);
}

const float prevalence_red_giants_factor = 3.0; // larger, more red giants
const float brightness_distribution_factor = 2.0; // larger, more nonuniform brightness

void brightness_temperature(vec3 pos, out float brightness_factor, out float temperature){
  vec3 ab = rand3(vec4(pos, 1.234567));
  float a = ab.x;
  float b = ab.y;
  float br = 1.0 / (a + 1.0 / brightness_distribution_factor);
  const float temperature_distribution = prevalence_red_giants_factor;
  float t = exp(-b * temperature_distribution) * 30000.0;
  temperature = t;
  vec3 c = blackbody_radiation(t);
  float lc = length(c);
  brightness_factor = br / lc;
}

varying vec4 color;
void main() {
  float grid_size = exp2(my_position.w);
  float offset_scale = exp2(-my_position.w);
  vec3 offset_s = offset * offset_scale;

  vec3 render_offset = (fract(offset_s)-vec3(0.5)) * grid_size;

  vec3 seed = floor(offset_s) * grid_size + my_position.xyz;

  vec3 star_offset = rand3(vec4(seed, my_position.w)) * 2.0 - vec3(1.0);

  vec3 star_pos_local = my_position.xyz + star_offset * grid_size - render_offset;

  // range of my_position (in grid_sizes) is from -15.5 to 15.5
  // star offset is +-1 grid size
  // render_offset is +-0.5 grid size
  // 14x grid size is the furthest that the star could pop into the view.

  float bf, temperature;
    brightness_temperature(seed + vec3(1.1, 2.2, 3.3), bf, temperature);

  //Doppler effect and aberration at once using Lorentz transformation
  vec3 dpos = star_pos_local - frac_cam_pos;
  float r2 = dot(dpos, dpos);
  float r = sqrt(r2);
  float fade = clamp((14.0 * grid_size - r) * 0.5, 0.0, 1.0);
  // 4-position of where and when the light was emitted
  vec4 dpos_dt_world = vec4(dpos, -r);
  vec4 dpos_dt_local = lorentz * dpos_dt_world;
  // normalize to avoid clipping
  vec3 dir = normalize(dpos_dt_local.xyz);
  // How this works: both observers agree that the same number of waves fit into the spacetime interval.
  // The frequency change is thus the ratio of times.
  float df = dpos_dt_local.w / dpos_dt_world.w;

  /* Intensity changes in the Doppler effect
  Montgomery H. Johnson and Edward Teller
  PNAS February 1, 1982 79 (4) 1340; */

  vec3 col = blackbody_radiation(temperature * df) * (bf * brightness_scale / (r2 * df * df));

  gl_Position = projectionMatrix * vec4(dir, 1.0);
  color = vec4(col * fade, 1.0);
  gl_PointSize = 1.0;
}