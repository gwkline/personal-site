import * as THREE from "three";

import type {
  WallpaperConfig,
  WallpaperMode,
} from "@/components/wallpaper/wallpaper-types";

const VERTEX_SHADER = `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform float uSpeed;
  uniform float uEnergy;
  uniform float uDensity;
  uniform float uScale;
  uniform float uContrast;
  uniform float uGrain;
  uniform float uPhase;
  uniform float uBalance;
  uniform float uSeed;
  uniform int uMode;
  uniform vec2 uResolution;
  uniform vec3 uColors[4];
  uniform sampler2D uAsciiAtlas;

  #define TAU 6.28318530718

  float hash21(vec2 point) {
    point = fract(point * vec2(123.34, 456.21));
    point += dot(point, point + 45.32 + uSeed);
    return fract(point.x * point.y);
  }

  float valueNoise(vec2 point) {
    vec2 cell = floor(point);
    vec2 local = fract(point);
    local = local * local * (3.0 - 2.0 * local);
    return mix(
      mix(hash21(cell), hash21(cell + vec2(1.0, 0.0)), local.x),
      mix(
        hash21(cell + vec2(0.0, 1.0)),
        hash21(cell + vec2(1.0)),
        local.x
      ),
      local.y
    );
  }

  float fbm(vec2 point) {
    float value = 0.0;
    float amplitude = 0.5;
    mat2 rotation = mat2(0.8, 0.6, -0.6, 0.8);
    for (int octave = 0; octave < 5; octave++) {
      value += amplitude * valueNoise(point);
      point = rotation * point * 2.03 + 13.7;
      amplitude *= 0.5;
    }
    return value;
  }

  vec3 adaptiveBlend(vec3 base, vec3 layer, float opacity) {
    vec3 screened = 1.0 - (1.0 - base) * (1.0 - layer);
    vec3 multiplied = base * layer;
    float backgroundLuminance = dot(
      uColors[0],
      vec3(0.2126, 0.7152, 0.0722)
    );
    vec3 blended = mix(
      screened,
      multiplied,
      smoothstep(0.45, 0.8, backgroundLuminance)
    );
    return mix(base, blended, clamp(opacity, 0.0, 1.0));
  }

  vec3 renderAurora(vec2 point, float time) {
    float detail = mix(1.25, 3.3, uDensity);
    vec2 flow = vec2(
      fbm(
        point * detail +
        vec2(time * 0.09, -time * 0.04) +
        uPhase * 3.1
      ),
      fbm(
        point * detail * 1.12 +
        vec2(-time * 0.05, time * 0.08) +
        9.2 -
        uPhase * 2.7
      )
    );
    vec2 warped = point + (flow - 0.5) * (0.3 + uEnergy * 1.25);
    float field = fbm(warped * (1.45 + detail * 0.32));
    float ribbon = sin(
      warped.x * (2.2 + detail) +
      warped.y * 2.0 +
      field * (4.0 + uEnergy * 7.0) -
      time * 0.2
    );
    ribbon = smoothstep(-0.55, 0.95, ribbon);
    float light = smoothstep(0.22, 0.92, field + ribbon * 0.38);
    vec3 color = mix(uColors[0], uColors[1], field * 0.72);
    color = mix(
      color,
      mix(uColors[1], uColors[2], uBalance),
      ribbon * (0.2 + uEnergy * 0.45)
    );
    color = adaptiveBlend(color, uColors[3], light * 0.3);
    color += uColors[1] * pow(max(0.0, ribbon), 6.0) * 0.12 * uEnergy;
    return color;
  }

  vec3 asciiPalette(float position) {
    position = fract(position);
    if (position < 0.3333) {
      return mix(uColors[1], uColors[2], position * 3.0);
    }
    if (position < 0.6666) {
      return mix(uColors[2], uColors[3], (position - 0.3333) * 3.0);
    }
    return mix(uColors[3], uColors[1], (position - 0.6666) * 3.0);
  }

  vec3 renderAsciiPatterns(vec2 uv, float time) {
    float aspect = uResolution.x / max(1.0, uResolution.y);
    float columns = floor(mix(56.0, 160.0, uDensity));
    // Cells are half as wide as they are tall, matching the atlas tiles,
    // so glyphs pack like a terminal instead of stretching apart.
    vec2 grid = vec2(columns, max(4.0, floor(columns / max(0.3, aspect) * 0.5)));
    vec2 cell = floor(uv * grid);
    vec2 local = fract(uv * grid);
    vec2 sampleUv = (cell + 0.5) / grid;
    vec2 patternPoint = sampleUv - 0.5;
    patternPoint.x *= aspect;
    patternPoint *= mix(0.85, 2.1, uScale);

    float angle = (uPhase - 0.5) * TAU;
    mat2 direction = mat2(
      cos(angle),
      -sin(angle),
      sin(angle),
      cos(angle)
    );
    vec2 directedPoint = direction * patternPoint;
    float detail = mix(2.0, 5.8, uDensity);
    float warp = fbm(
      directedPoint * (1.35 + uEnergy * 1.8) +
      vec2(time * 0.14, -time * 0.1)
    );
    float secondaryWarp = fbm(
      directedPoint.yx * (2.1 + uEnergy * 2.4) -
      vec2(time * 0.11, time * 0.08) +
      7.3
    );

    float waves = 0.5 +
      0.5 *
      sin(
        directedPoint.x * (5.0 + detail * 2.4) +
        directedPoint.y * 1.6 +
        warp * (3.0 + uEnergy * 7.0) -
        time * 1.1
      );
    waves = mix(
      waves,
      0.5 +
        0.5 *
        sin(
          directedPoint.x * (8.0 + detail) -
          directedPoint.y * 3.2 +
          secondaryWarp * 4.8 +
          time * 0.72
        ),
      0.28
    );

    float clouds = fbm(
      directedPoint * (1.45 + detail * 0.34) +
      vec2(time * 0.1, -time * 0.065)
    );
    clouds = smoothstep(
      0.2,
      0.86,
      clouds + secondaryWarp * (0.24 + uEnergy * 0.28)
    );

    float weaveX = 0.5 +
      0.5 *
      sin(
        directedPoint.x * (8.0 + detail * 2.8) +
        warp * 3.2 -
        time * 0.85
      );
    float weaveY = 0.5 +
      0.5 *
      cos(
        directedPoint.y * (9.0 + detail * 2.4) -
        secondaryWarp * 3.6 +
        time * 0.68
      );
    float weave = abs(weaveX - weaveY);

    float bands = abs(
      fract(
        clouds * (5.0 + detail * 2.0) +
        directedPoint.y * 0.8 -
        time * 0.16
      ) -
      0.5
    ) * 2.0;
    bands = 1.0 - smoothstep(0.08, 0.7, bands);

    float composition = mod(floor(uSeed), 4.0);
    float pattern;
    if (composition < 1.0) {
      pattern = waves;
    } else if (composition < 2.0) {
      pattern = clouds;
    } else if (composition < 3.0) {
      pattern = weave;
    } else {
      pattern = mix(bands, waves, 0.24 + secondaryWarp * 0.28);
    }

    pattern +=
      (hash21(cell + floor(uSeed)) - 0.5) *
      mix(0.025, 0.11, uGrain / 0.2);
    pattern = clamp(pattern, 0.0, 0.999);
    float shapedPattern = pow(pattern, mix(1.35, 0.7, uContrast));
    shapedPattern = clamp(
      (shapedPattern - 0.5) * mix(1.05, 1.5, uContrast) + 0.5,
      0.0,
      0.999
    );
    // Index 0 is a blank tile so dark regions read as true negative space.
    float glyphIndex = floor(shapedPattern * 16.0);
    vec2 glyphLocal = clamp(local, vec2(0.03), vec2(0.97));
    vec2 atlasUv = vec2(
      (glyphIndex + glyphLocal.x) / 16.0,
      1.0 - glyphLocal.y
    );
    float glyph = texture2D(uAsciiAtlas, atlasUv).r;

    float colorPosition = shapedPattern * (0.36 + uBalance * 0.42) +
      sampleUv.x * 0.32 +
      sampleUv.y * 0.2 +
      time * 0.03;
    vec3 glyphColor = asciiPalette(colorPosition);
    glyphColor = mix(
      glyphColor,
      uColors[3],
      smoothstep(0.78, 1.0, shapedPattern) * 0.42
    );
    vec3 backgroundColor = mix(
      uColors[0],
      asciiPalette(colorPosition + 0.18),
      0.018 + shapedPattern * 0.025
    );
    float glyphOpacity = glyph * (0.66 + shapedPattern * 0.34 + uEnergy * 0.1);
    return mix(backgroundColor, glyphColor, min(1.0, glyphOpacity));
  }

  float glassField(vec2 point, float time, float offset) {
    vec2 warped = point;
    float field = 0.0;
    float detail = mix(1.4, 3.8, uDensity);
    for (int layer = 0; layer < 5; layer++) {
      float index = float(layer) + 1.0;
      warped +=
        sin(
          warped.yx * (detail + index * 0.62) +
          vec2(time * (0.12 + index * 0.025), -time * 0.09) +
          index +
          offset
        ) *
        (0.2 + uEnergy * 0.22) /
        index;
      field +=
        sin(warped.x * (2.0 + index * 0.72) + index) +
        cos(warped.y * (2.35 + index * 0.56) - index);
    }
    return field / 10.0;
  }

  vec3 renderRefraction(vec2 point, float time) {
    float chroma = mix(0.006, 0.032, uBalance);
    vec2 phasedPoint = point + vec2(
      sin(uPhase * TAU),
      cos(uPhase * TAU)
    ) * 0.08;
    float red = glassField(phasedPoint, time, chroma);
    float green = glassField(phasedPoint, time, 0.0);
    float blue = glassField(phasedPoint, time, -chroma);
    vec3 field = vec3(red, green, blue);
    vec3 caustic = pow(abs(sin(field * 5.0 + uSeed * 0.1)), vec3(8.0));
    float causticLight = max(caustic.r, max(caustic.g, caustic.b));
    float body = smoothstep(-0.72, 0.78, green);
    float edge = pow(1.0 - abs(green), 4.0);
    vec3 color = mix(uColors[0], uColors[1], body * 0.56);
    color = mix(color, uColors[2], smoothstep(0.15, 0.85, red) * 0.36);
    color = adaptiveBlend(
      color,
      mix(uColors[2], uColors[3], caustic),
      causticLight * (0.3 + uEnergy * 0.7)
    );
    color += uColors[2] * edge * 0.11;
    return color;
  }

  vec3 renderTopography(vec2 point, float time) {
    vec2 driftDirection = vec2(
      cos(uPhase * TAU),
      sin(uPhase * TAU)
    );
    vec2 drift = driftDirection * time * 0.045;
    float detail = mix(1.5, 4.8, uDensity);
    float terrain = fbm(point * detail + drift);
    terrain +=
      fbm(point * detail * 2.1 - drift * 1.7) *
      mix(0.18, 0.52, uEnergy);
    float bands = mix(10.0, 42.0, uDensity);
    float contourDistance = abs(fract(terrain * bands) - 0.5);
    float contour = 1.0 - smoothstep(0.015, 0.085, contourDistance);
    float majorDistance = abs(
      fract(terrain * bands * mix(0.14, 0.3, uBalance)) - 0.5
    );
    float major = 1.0 - smoothstep(0.012, 0.052, majorDistance);
    float glow = smoothstep(0.42, 0.95, terrain);
    vec3 color = mix(uColors[0], uColors[1], terrain * 0.2);
    color = adaptiveBlend(color, uColors[2], contour * (0.26 + uEnergy * 0.34));
    color = adaptiveBlend(color, uColors[3], major * 0.52);
    color += uColors[1] * glow * 0.09;
    return color;
  }

  vec3 renderInterference(vec2 point, float time) {
    float frequency = mix(14.0, 54.0, uDensity);
    vec2 firstOrigin = vec2(
      sin(time * 0.17 + uSeed + uPhase * TAU) * 0.32,
      cos(time * 0.13 + uPhase * 2.4) * 0.28
    );
    vec2 secondOrigin = vec2(
      cos(time * 0.11 - uSeed) * 0.38,
      sin(time * 0.19) * 0.3
    );
    float firstDistance = length(point - firstOrigin);
    float secondDistance = length(point - secondOrigin);
    float firstWave = sin(firstDistance * frequency - time * 1.3);
    float secondWave = sin(
      secondDistance *
      frequency *
      mix(0.94, 1.12, uBalance) -
      time
    );
    float interference = firstWave * secondWave;
    float lines = pow(abs(interference), mix(8.0, 2.5, uEnergy));
    float field = smoothstep(-0.8, 0.85, interference);
    vec3 color = mix(uColors[0], uColors[1], field * 0.42);
    color = mix(color, uColors[2], smoothstep(0.1, 0.9, lines) * 0.52);
    color = adaptiveBlend(color, uColors[3], lines * 0.48);
    return color;
  }

  void main() {
    float time = uTime * uSpeed;
    vec2 screenPoint = vUv - 0.5;
    screenPoint.x *= uResolution.x / max(1.0, uResolution.y);
    vec2 point = screenPoint * mix(0.62, 2.3, uScale);
    vec3 color;

    if (uMode == 0) {
      color = renderAurora(point, time);
    } else if (uMode == 1) {
      color = renderAsciiPatterns(vUv, time);
    } else if (uMode == 2) {
      color = renderRefraction(point, time);
    } else if (uMode == 3) {
      color = renderTopography(point, time);
    } else {
      color = renderInterference(point, time);
    }

    float contrast = mix(0.72, 1.62, uContrast);
    color = (color - 0.5) * contrast + 0.5;
    float grain = hash21(gl_FragCoord.xy + floor(time * 12.0)) - 0.5;
    color += grain * uGrain * 0.065;
    float vignette = smoothstep(1.05, 0.22, length(screenPoint));
    color *= 0.77 + vignette * 0.23;
    color = pow(max(color, 0.0), vec3(0.94));

    gl_FragColor = vec4(color, 1.0);
    #include <colorspace_fragment>
  }
`;

const getModeIndex = (mode: WallpaperMode) => {
  switch (mode) {
    case "aurora": {
      return 0;
    }
    case "ascii": {
      return 1;
    }
    case "refraction": {
      return 2;
    }
    case "topography": {
      return 3;
    }
    case "interference": {
      return 4;
    }
    default: {
      const exhaustiveMode: never = mode;
      return exhaustiveMode;
    }
  }
};

export const createAsciiAtlas = () => {
  const glyphs = [
    " ",
    ".",
    "·",
    ":",
    ",",
    ";",
    "-",
    "~",
    "+",
    "=",
    "*",
    "x",
    "%",
    "#",
    "&",
    "@",
  ];
  // Tiles are 1:2 (width:height) to match the shader's terminal-style grid
  // cells, so glyphs sample without vertical stretching.
  const tileWidth = 32;
  const tileHeight = 64;
  const canvas = document.createElement("canvas");
  canvas.width = tileWidth * glyphs.length;
  canvas.height = tileHeight;
  const context = canvas.getContext("2d");
  if (!context) {
    return new THREE.Texture();
  }
  context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = "#fff";
  context.font = '500 46px "Geist Mono Variable", ui-monospace, monospace';
  context.textAlign = "center";
  context.textBaseline = "middle";
  for (const [index, glyph] of glyphs.entries()) {
    context.fillText(
      glyph,
      index * tileWidth + tileWidth / 2,
      tileHeight / 2 + 2
    );
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.NoColorSpace;
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  return texture;
};

export const createWallpaperMaterial = (atlas: THREE.Texture) =>
  new THREE.ShaderMaterial({
    depthTest: false,
    depthWrite: false,
    fragmentShader: FRAGMENT_SHADER,
    uniforms: {
      uAsciiAtlas: { value: atlas },
      uBalance: { value: 0 },
      uColors: {
        value: Array.from({ length: 4 }, () => new THREE.Vector3()),
      },
      uContrast: { value: 0 },
      uDensity: { value: 0 },
      uEnergy: { value: 0 },
      uGrain: { value: 0 },
      uMode: { value: 0 },
      uPhase: { value: 0 },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uScale: { value: 0 },
      uSeed: { value: 0 },
      uSpeed: { value: 0 },
      uTime: { value: 0 },
    },
    vertexShader: VERTEX_SHADER,
  });

const smoothstep = (value: number) => value * value * (3 - 2 * value);

export const updateWallpaperMaterial = (
  material: THREE.ShaderMaterial,
  config: WallpaperConfig,
  width: number,
  height: number,
  time: number
) => {
  material.uniforms.uTime.value = time;
  material.uniforms.uBalance.value = config.balance;
  material.uniforms.uSpeed.value = config.speed;
  material.uniforms.uEnergy.value = config.energy;
  material.uniforms.uDensity.value = config.density;
  material.uniforms.uScale.value = config.scale;
  material.uniforms.uContrast.value = config.contrast;
  material.uniforms.uGrain.value = config.grain;
  material.uniforms.uPhase.value = config.phase;
  material.uniforms.uSeed.value = config.seed;
  material.uniforms.uMode.value = getModeIndex(config.mode);
  material.uniforms.uResolution.value.set(width, height);

  const paletteColors = config.palette.colors.map(
    (color) => new THREE.Color(color)
  );
  const [background] = paletteColors;
  material.uniforms.uColors.value[0].set(
    background.r,
    background.g,
    background.b
  );

  const morphPosition = (time * config.colorMorph * 0.22) % 3;
  const morphOffset = Math.floor(morphPosition);
  const morphBlend = smoothstep(morphPosition - morphOffset);
  for (let index = 0; index < 3; index += 1) {
    const source = paletteColors[1 + ((index + morphOffset) % 3)];
    const target = paletteColors[1 + ((index + morphOffset + 1) % 3)];
    material.uniforms.uColors.value[index + 1].set(
      THREE.MathUtils.lerp(source.r, target.r, morphBlend),
      THREE.MathUtils.lerp(source.g, target.g, morphBlend),
      THREE.MathUtils.lerp(source.b, target.b, morphBlend)
    );
  }
};
