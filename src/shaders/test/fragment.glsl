/**
If you use RawShaderMaterial add 
precision mediump float;

And if you use ShaderMaterial remove then because they are already define
*/

uniform vec3 uColor;
uniform sampler2D uTexture;

varying float vRandom;
varying vec2 vUv;
varying float vElevation;


void main() {

  // Add texuture 
  // vec4 textureColor = texture2D(uTexture, vUv);
  // textureColor.rgb *= vElevation * 2.0 + 0.9;
  // gl_FragColor = textureColor;

  // Random Color
  gl_FragColor = vec4(-vRandom, vUv, 1.0);

  
}