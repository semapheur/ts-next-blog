#version 300 es

out vec4 fragColor;
varying vec4 color;

void main() {
  fragColor = color;
}