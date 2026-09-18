import { j as e, S as SpectraCard, c as ReactDOM, r as React, f as OceanShader } from "./index-C0fSA6dq.js";

const { useState } = React;

const h = (type, props, ...kids) =>
  e.jsx(
    type,
    Object.assign(
      {},
      props,
      kids.length ? { children: kids.length === 1 ? kids[0] : kids } : {}
    )
  );

const PALETTES = [
  { value: "ocean", label: "海洋" },
  { value: "original", label: "原色" },
  { value: "klein", label: "克莱因" },
  { value: "violet-lime", label: "紫绿" },
  { value: "chrome", label: "金属" },
  { value: "plus", label: "红金" },
  { value: "qinghua", label: "青花瓷" },
  { value: "zhusha", label: "朱砂" },
  { value: "shanqing", label: "青绿山水" },
  { value: "yanzhi", label: "胭脂" },
  { value: "liujin", label: "鎏金" },
  { value: "shuimo", label: "水墨" },
];

const OCEAN_COLORS = {
  baseWhite: "vec3(0.985, 0.995, 1.0)",
  paleCyan: "vec3(0.7, 0.94, 1.0)",
  brightCyan: "vec3(0.02, 0.86, 0.96)",
  electricBlue: "vec3(0.04, 0.36, 1.0)",
  ultramarine: "vec3(0.18, 0.09, 0.84)",
  deepPurple: "vec3(0.46, 0.05, 0.78)",
  vividViolet: "vec3(0.68, 0.16, 0.94)",
  highlight: "vec3(0.9, 0.985, 1.0)",
};

const PALETTE_COLORS = {
  original: {
    baseWhite: "vec3(1.0, 0.985, 0.99)",
    paleCyan: "vec3(1.0, 0.82, 0.9)",
    brightCyan: "vec3(1.0, 0.22, 0.42)",
    electricBlue: "vec3(1.0, 0.42, 0.12)",
    ultramarine: "vec3(0.95, 0.06, 0.5)",
    deepPurple: "vec3(0.78, 0.04, 0.62)",
    vividViolet: "vec3(1.0, 0.38, 0.16)",
    highlight: "vec3(1.0, 0.95, 0.98)",
  },
  klein: {
    baseWhite: "vec3(0.985, 0.99, 1.0)",
    paleCyan: "vec3(0.75, 0.87, 1.0)",
    brightCyan: "vec3(0.0, 0.18, 0.65)",
    electricBlue: "vec3(1.0, 0.35, 0.12)",
    ultramarine: "vec3(0.03, 0.1, 0.38)",
    deepPurple: "vec3(0.02, 0.03, 0.14)",
    vividViolet: "vec3(0.25, 0.35, 0.9)",
    highlight: "vec3(0.9, 0.96, 1.0)",
  },
  "violet-lime": {
    baseWhite: "vec3(0.99, 0.985, 1.0)",
    paleCyan: "vec3(0.8, 0.72, 0.98)",
    brightCyan: "vec3(0.72, 0.94, 0.0)",
    electricBlue: "vec3(0.62, 0.9, 0.0)",
    ultramarine: "vec3(0.42, 0.14, 0.92)",
    deepPurple: "vec3(0.36, 0.06, 0.7)",
    vividViolet: "vec3(0.6, 0.42, 1.0)",
    highlight: "vec3(0.98, 0.97, 1.0)",
  },
  chrome: {
    baseWhite: "vec3(0.97, 0.98, 0.99)",
    paleCyan: "vec3(0.86, 0.89, 0.93)",
    brightCyan: "vec3(0.36, 0.4, 0.45)",
    electricBlue: "vec3(0.55, 0.6, 0.66)",
    ultramarine: "vec3(0.16, 0.19, 0.24)",
    deepPurple: "vec3(0.08, 0.09, 0.12)",
    vividViolet: "vec3(0.5, 0.55, 0.62)",
    highlight: "vec3(0.95, 0.97, 1.0)",
  },
  plus: {
    baseWhite: "vec3(1.0, 0.985, 0.97)",
    paleCyan: "vec3(1.0, 0.88, 0.72)",
    brightCyan: "vec3(1.0, 0.76, 0.08)",
    electricBlue: "vec3(1.0, 0.13, 0.31)",
    ultramarine: "vec3(0.66, 0.0, 0.2)",
    deepPurple: "vec3(0.95, 0.55, 0.0)",
    vividViolet: "vec3(1.0, 0.66, 0.0)",
    highlight: "vec3(1.0, 0.97, 0.9)",
  },
  qinghua: {
    baseWhite: "vec3(0.969, 0.973, 0.953)",
    paleCyan: "vec3(0.863, 0.902, 0.949)",
    brightCyan: "vec3(0.247, 0.435, 0.678)",
    electricBlue: "vec3(0.118, 0.306, 0.549)",
    ultramarine: "vec3(0.086, 0.204, 0.373)",
    deepPurple: "vec3(0.055, 0.133, 0.251)",
    vividViolet: "vec3(0.357, 0.514, 0.722)",
    highlight: "vec3(0.992, 0.996, 0.976)",
  },
  zhusha: {
    baseWhite: "vec3(0.98, 0.965, 0.937)",
    paleCyan: "vec3(0.953, 0.851, 0.788)",
    brightCyan: "vec3(0.765, 0.153, 0.169)",
    electricBlue: "vec3(0.788, 0.635, 0.153)",
    ultramarine: "vec3(0.647, 0.133, 0.165)",
    deepPurple: "vec3(0.431, 0.082, 0.11)",
    vividViolet: "vec3(0.851, 0.525, 0.243)",
    highlight: "vec3(1.0, 0.976, 0.925)",
  },
  shanqing: {
    baseWhite: "vec3(0.961, 0.969, 0.949)",
    paleCyan: "vec3(0.804, 0.902, 0.863)",
    brightCyan: "vec3(0.184, 0.659, 0.627)",
    electricBlue: "vec3(0.184, 0.494, 0.62)",
    ultramarine: "vec3(0.114, 0.31, 0.4)",
    deepPurple: "vec3(0.078, 0.196, 0.247)",
    vividViolet: "vec3(0.298, 0.561, 0.608)",
    highlight: "vec3(0.984, 0.992, 0.973)",
  },
  yanzhi: {
    baseWhite: "vec3(0.984, 0.965, 0.957)",
    paleCyan: "vec3(0.941, 0.851, 0.839)",
    brightCyan: "vec3(0.761, 0.353, 0.361)",
    electricBlue: "vec3(0.627, 0.157, 0.2)",
    ultramarine: "vec3(0.494, 0.118, 0.157)",
    deepPurple: "vec3(0.353, 0.078, 0.114)",
    vividViolet: "vec3(0.847, 0.541, 0.557)",
    highlight: "vec3(1.0, 0.973, 0.965)",
  },
  liujin: {
    baseWhite: "vec3(0.98, 0.961, 0.902)",
    paleCyan: "vec3(0.949, 0.89, 0.737)",
    brightCyan: "vec3(0.89, 0.698, 0.235)",
    electricBlue: "vec3(0.761, 0.494, 0.165)",
    ultramarine: "vec3(0.557, 0.353, 0.118)",
    deepPurple: "vec3(0.369, 0.227, 0.071)",
    vividViolet: "vec3(0.851, 0.643, 0.255)",
    highlight: "vec3(1.0, 0.976, 0.91)",
  },
  shuimo: {
    baseWhite: "vec3(0.957, 0.953, 0.933)",
    paleCyan: "vec3(0.847, 0.839, 0.808)",
    brightCyan: "vec3(0.561, 0.545, 0.51)",
    electricBlue: "vec3(0.333, 0.322, 0.298)",
    ultramarine: "vec3(0.2, 0.184, 0.169)",
    deepPurple: "vec3(0.11, 0.102, 0.09)",
    vividViolet: "vec3(0.435, 0.42, 0.388)",
    highlight: "vec3(0.984, 0.976, 0.953)",
  },
};

function buildPaletteShader(colors) {
  let s = OceanShader;
  for (const key of Object.keys(OCEAN_COLORS)) {
    s = s.split(OCEAN_COLORS[key]).join(colors[key] || OCEAN_COLORS[key]);
  }
  return s;
}

const PALETTE_SHADERS = {
  ocean: OceanShader,
  original: buildPaletteShader(PALETTE_COLORS.original),
  klein: buildPaletteShader(PALETTE_COLORS.klein),
  "violet-lime": buildPaletteShader(PALETTE_COLORS["violet-lime"]),
  chrome: buildPaletteShader(PALETTE_COLORS.chrome),
  plus: buildPaletteShader(PALETTE_COLORS.plus),
  qinghua: buildPaletteShader(PALETTE_COLORS.qinghua),
  zhusha: buildPaletteShader(PALETTE_COLORS.zhusha),
  shanqing: buildPaletteShader(PALETTE_COLORS.shanqing),
  yanzhi: buildPaletteShader(PALETTE_COLORS.yanzhi),
  liujin: buildPaletteShader(PALETTE_COLORS.liujin),
  shuimo: buildPaletteShader(PALETTE_COLORS.shuimo),
};

const TEXTURE_OPTIONS = [
  { value: "fbm", label: "经典FBM" },
  { value: "ridged", label: "山脊" },
  { value: "cell", label: "细胞" },
  { value: "grain", label: "颗粒" },
];

const STRUCTURE_OPTIONS = [
  { value: "none", label: "无" },
  { value: "mirror", label: "镜像" },
  { value: "kaleido", label: "万花筒" },
  { value: "polar", label: "极坐标" },
  { value: "tunnel", label: "隧道" },
];

const DRIVE_OPTIONS = [
  { value: "standard", label: "标准" },
  { value: "curl", label: "Curl旋流" },
  { value: "diff", label: "差分细丝" },
  { value: "vortex", label: "涡量增强" },
];

const MATERIAL_OPTIONS = [
  { value: "palette", label: "配色" },
  { value: "blackbody", label: "黑体热力" },
  { value: "iris", label: "虹彩" },
  { value: "neon", label: "霓虹发光" },
];

const REVEAL_OPTIONS = [
  { value: "linear", label: "线性渐变" },
  { value: "dissolve", label: "噪声溶解" },
  { value: "scan", label: "扫描显形" },
  { value: "threshold", label: "阈值分层" },
  { value: "edge", label: "边缘点燃" },
];

const DITHER_MATRIX_OPTIONS = [
  { value: "2", label: "2×2" },
  { value: "4", label: "4×4" },
  { value: "8", label: "8×8" },
];

const DITHER_MODE_OPTIONS = [
  { value: "0", label: "密度点阵 Bayer" },
  { value: "1", label: "半调圆点 Halftone" },
  { value: "2", label: "X 形簇点 Clustered" },
  { value: "3", label: "混合叠加 All" },
];

const optLabel = (options, value) => {
  const o = options.find((x) => x.value === value);
  return o ? o.label : String(value);
};
const paletteLabel = (value) => {
  const o = PALETTES.find((x) => x.value === value);
  return o ? o.label : String(value);
};

function replaceOnce(src, oldText, newText) {
  const parts = src.split(oldText);
  if (parts.length !== 2) {
    throw new Error("Style anchor mismatch: " + oldText.slice(0, 40));
  }
  return parts.join(newText);
}

function insertAfter(src, anchor, insert) {
  return replaceOnce(src, anchor, anchor + insert);
}

const A_P = `    vec2 p = uv - 0.5;
    p.x *= aspect;`;
const B_WARP = `    warpedP +=
      flowC *
      detailWarpStrength *
      scale *
      bottomActivity;`;
const F_MASK = `    float fluidMask = clamp((1.0 - uv.y + maskNoise) / max(uSoftness, 0.1), 0.0, 1.0);`;
const G_COLOR = `    vec3 color = mix(
      ditherPaper,
      fluidColor,
      ditherMix
    );`;
const H_CLAMP = `    color = clamp(color, 0.0, 1.0);`;
const D_FILM = `    float filmHighlight =
      smoothstep(
        0.6,
        0.92,
        0.5 +
        0.5 * sin(
          warpedP.x * 3.6 +
          warpedP.y * 5.1 -
          t * 1.36 +
          flowC.y * 2.2
        )
      ) *
      smoothstep(0.48, 0.72, 1.0 - uv.y) * (1.0 - smoothstep(0.88, 0.99, 1.0 - uv.y));`;
const FLOW_A = `    vec2 flowA = vec2(
      fbm(domain * 0.7 * uTexDensity + vec2(t * 0.16, -t * 0.1)),
      fbm(domain * 0.82 * uTexDensity + vec2(-t * 0.14, t * 0.12) + 5.2)
    ) * 2.0 - 1.0;`;
const FLOW_B = `    vec2 flowB = vec2(
      fbm(warpedP * 1.65 / scale * uTexDensity + vec2(-t * 0.33, t * 0.2) + 3.4),
      fbm(warpedP * 1.85 / scale * uTexDensity + vec2(t * 0.28, -t * 0.24) - 2.7)
    ) * 2.0 - 1.0;`;
const PALE_LINE = `    float paleField = organicField(qPale, 2.15);`;
const ORG_FN = `  float organicField(vec2 q, float falloff) {
    return exp(-dot(q, q) * falloff);
  }`;
const FLUID_MIX = `    vec3 fluidColor = baseWhite;
    fluidColor = mix(
      fluidColor,
      paleCyan,
      paleField * 0.58
    );
    fluidColor = mix(
      fluidColor,
      brightCyan,
      coralDominance * coralField * 0.78
    );
    fluidColor = mix(
      fluidColor,
      electricBlue,
      orangeDominance * 0.74
    );
    fluidColor = mix(
      fluidColor,
      ultramarine,
      pinkDominance * 0.9
    );
    fluidColor = mix(
      fluidColor,
      deepPurple,
      pinkDominance *
      hotPinkField *
      smoothstep(0.35, 0.92, surge) * 0.66
    );
    fluidColor = mix(
      fluidColor,
      vividViolet,
      violetField *
      (1.0 - orangeDominance * 0.42) * 0.8
    );`;

const MIRROR_P = `    vec2 p = uv - 0.5;
    p.x *= aspect;
    p.x = abs(p.x);`;
const KALEO_P = `    vec2 p = uv - 0.5;
    p.x *= aspect;
    p.x = abs(fract(p.x / (0.22 * aspect)) - 0.5) * (0.44 * aspect);`;
const POLAR_P = `    vec2 p = uv - 0.5;
    p.x *= aspect;
    p = rotate2d(uTime * 0.12) * p;
    float pr = length(p);
    float pa = atan(p.y, p.x);
    p += vec2(cos(pa * 3.0 + uTime * 0.35), sin(pa * 3.0 + uTime * 0.35)) * 0.06 * pr;
    p *= 1.0 - 0.12 * dot(p, p);`;
const TUNNEL_P = `    vec2 p = uv - 0.5;
    p.x *= aspect;
    float depthFrac = 1.0 - uv.y;
    p.x /= max(0.22 + depthFrac * 0.9, 0.12);
    p.y *= 0.7 + depthFrac * 0.5;`;

const RIDGE_TEX = `
    float ridgeTex = 1.0 - abs(2.0 * fbm(warpedP * 2.4 / scale + vec2(t * 0.18, -t * 0.14) + 4.2) - 1.0);
    hotPinkField *= 0.35 + 0.9 * ridgeTex;
    orangeField *= 0.35 + 0.9 * ridgeTex;
    coralField *= 0.35 + 0.9 * ridgeTex;
    violetField *= 0.35 + 0.9 * ridgeTex;
    paleField *= 0.25 + 0.75 * ridgeTex;`;

const GRAIN_TEX = `
    float grainTex = hash21(warpedP * 160.0 + vec2(fract(t * 0.4) * 7.0));
    hotPinkField *= 0.7 + 0.6 * grainTex;
    orangeField *= 0.7 + 0.6 * grainTex;
    coralField *= 0.7 + 0.6 * grainTex;
    violetField *= 0.7 + 0.6 * grainTex;
    paleField *= 0.6 + 0.8 * grainTex;`;

const VORONOI = `
    vec2 cp = warpedP * vec2(2.2, 3.0) / scale + vec2(t * 0.05, -t * 0.04);
    vec2 cell = floor(cp);
    vec2 fr = fract(cp);
    float m1 = 1e5;
    float m2 = 1e5;
    for (int j = -1; j <= 1; j++) {
      for (int k = -1; k <= 1; k++) {
        vec2 g = vec2(float(j), float(k));
        vec2 rnd = vec2(hash21(cell + g + vec2(7.7, 3.1)), hash21(cell + g + vec2(12.1, 5.9)));
        vec2 point = g + rnd - fr;
        float dd = dot(point, point);
        if (dd < m1) { m2 = m1; m1 = dd; } else if (dd < m2) { m2 = dd; }
      }
    }
    float vor = sqrt(m1);
    hotPinkField = clamp(1.0 - vor * 2.4, 0.0, 1.0);
    orangeField = clamp(1.0 - sqrt(m2) * 2.2, 0.0, 1.0);
    coralField = clamp((1.0 - vor * 3.0) * (0.5 + 0.5 * sin(t * 0.7)), 0.0, 1.0);
    violetField = clamp(0.5 + 0.5 * sin(vor * 11.0 - t * 0.5), 0.0, 1.0);
    paleField = clamp(0.5 + 0.5 * cos(vor * 6.0 + t * 0.3), 0.0, 1.0);`;

const DIFF_FLOW = `
    vec2 diffFlow = vec2(
      fbm(warpedP * 2.1 / scale + vec2(t * 0.18, -t * 0.12) + 9.3) - fbm(warpedP * 2.35 / scale + vec2(-t * 0.15, t * 0.1) + 1.7),
      fbm(warpedP * 2.45 / scale + vec2(t * 0.14, t * 0.2) + 4.1) - fbm(warpedP * 2.6 / scale + vec2(-t * 0.22, -t * 0.16) + 8.8)
    );
    warpedP += diffFlow * 0.16 * scale * bottomActivity;`;

const CURL_A = `
    flowA = vec2(-flowA.y, flowA.x) * 0.55 + flowA * 0.45;`;
const CURL_B = `
    flowB = vec2(-flowB.y, flowB.x) * 0.5 + flowB * 0.5;`;

const BLACKBODY = `    vec3 fluidColor = baseWhite;
    float heat = clamp(hotPinkField * 0.75 + orangeField * 0.45 + coralField * 0.8 + violetField * 0.3, 0.0, 1.0);
    fluidColor = mix(vec3(0.06, 0.02, 0.14), vec3(0.65, 0.04, 0.18), smoothstep(0.0, 0.28, heat));
    fluidColor = mix(fluidColor, vec3(1.0, 0.26, 0.04), smoothstep(0.22, 0.55, heat));
    fluidColor = mix(fluidColor, vec3(1.0, 0.82, 0.16), smoothstep(0.52, 0.82, heat));
    fluidColor = mix(fluidColor, vec3(1.0, 0.96, 0.78), smoothstep(0.8, 1.0, heat));`;

const IRIS_FILM = `    float irisPhase = warpedP.x * 16.0 - warpedP.y * 10.0 + t * 1.2 + flowC.x * 4.0;
    float filmHighlight = smoothstep(0.45, 0.75, 0.5 + 0.5 * sin(irisPhase)) * smoothstep(0.4, 0.7, 1.0 - uv.y);`;
const IRIS_TINT = `
    float irisBand = 0.5 + 0.5 * sin(warpedP.x * 14.0 - t * 1.0 + flowB.y * 3.0);
    float irisTintMask = smoothstep(0.45, 0.75, 0.5 + 0.5 * sin(warpedP.x * 16.0 - warpedP.y * 10.0 + t * 1.2 + flowC.x * 4.0));
    color = mix(color, mix(brightCyan, vividViolet, irisBand), irisTintMask * 0.5 * fluidMask);`;
const HUE_FN = `
  vec3 hueRotate(vec3 c, float a) {
    vec3 k = vec3(0.57735, 0.57735, 0.57735);
    float ca = cos(a);
    float sa = sin(a);
    return c * ca + cross(k, c) * sa + k * dot(k, c) * (1.0 - ca);
  }`;
const IRIS_CLAMP = `    float disp = 0.03 * sin(warpedP.x * 24.0 + t * 0.6);
    color = vec3(clamp(color.r * (1.0 + disp), 0.0, 1.0), clamp(color.g * (1.0 + disp * 0.4), 0.0, 1.0), clamp(color.b * (1.0 - disp), 0.0, 1.0));
    color = hueRotate(color, 0.12 * sin(t * 0.35));
    color = clamp(color, 0.0, 1.0);`;

const NEON_GLOW = `
    float lum = dot(color, vec3(0.2126, 0.7152, 0.0722));
    float bloomTight = smoothstep(0.62, 0.78, lum);
    float bloomWide = smoothstep(0.38, 0.52, lum);
    color += brightCyan * (bloomTight * 0.55 + bloomWide * 0.2);
    float fres = pow(1.0 - abs(uv.x - 0.5) * 2.0, 2.5) + pow(1.0 - abs(uv.y - 0.5) * 2.0, 2.5);
    color = mix(color, highlight, fres * 0.22 * fluidMask);`;
const NEON_CLAMP = `    color = 1.0 - exp(-color * 2.2);
    color = color / (1.0 + color * 0.12);
    color += (hash21(uv * 913.7 + vec2(fract(t * 0.7) * 17.0)) * 2.0 - 1.0) / 240.0;
    color = clamp(color, 0.0, 1.0);`;

const DISSOLVE_MASK = `    float dissolve = fbm(warpedP * 3.2 / scale + vec2(t * 0.22, -t * 0.18) + 5.5);
    float fluidMask = smoothstep(0.42, 0.6, (1.0 - uv.y) * 0.8 + dissolve * 0.24);`;
const SCAN_MASK = `    float scan = 0.5 + 0.5 * sin(uv.y * 16.0 + t * 1.1);
    float dissolve = fbm(warpedP * 3.2 / scale + vec2(t * 0.22, -t * 0.18) + 5.5);
    float reveal = smoothstep(0.38, 0.68, (1.0 - uv.y) * 0.75 + scan * 0.14 + dissolve * 0.22);
    float fluidMask = reveal;`;
const THRESHOLD_MASK = `    float fluidMask = clamp(floor((1.0 - uv.y + maskNoise) * 5.0) / 4.0, 0.0, 1.0);`;
const EDGE_GLOW_INSERT = `
    float edgeGlow = exp(-pow((fluidMask - 0.5) * 6.0, 2.0));
    color = mix(color, brightCyan, edgeGlow * 0.55 * (0.6 + 0.4 * sin(t * 1.4)));`;

function buildCustomShader(src, stages) {
  let s = src;
  switch (stages.structure) {
    case "mirror":
      s = replaceOnce(s, A_P, MIRROR_P);
      break;
    case "kaleido":
      s = replaceOnce(s, A_P, KALEO_P);
      break;
    case "polar":
      s = replaceOnce(s, A_P, POLAR_P);
      break;
    case "tunnel":
      s = replaceOnce(s, A_P, TUNNEL_P);
      break;
  }
  switch (stages.texture) {
    case "ridged":
      s = insertAfter(s, PALE_LINE, RIDGE_TEX);
      break;
    case "cell":
      s = insertAfter(s, PALE_LINE, VORONOI);
      break;
    case "grain":
      s = insertAfter(s, PALE_LINE, GRAIN_TEX);
      break;
  }
  switch (stages.drive) {
    case "curl":
      s = replaceOnce(s, FLOW_A, FLOW_A + CURL_A);
      s = replaceOnce(s, FLOW_B, FLOW_B + CURL_B);
      break;
    case "diff":
      s = insertAfter(s, B_WARP, DIFF_FLOW);
      break;
    case "vortex":
      s = replaceOnce(s, `      1.25 * vortexBoost,`, `      1.7 * vortexBoost,`);
      s = replaceOnce(s, `      -1.1 * vortexBoost,`, `      -1.5 * vortexBoost,`);
      s = replaceOnce(s, `      0.95 * vortexBoost,`, `      1.3 * vortexBoost,`);
      break;
  }
  switch (stages.material) {
    case "blackbody":
      s = replaceOnce(s, FLUID_MIX, BLACKBODY);
      break;
    case "iris":
      s = replaceOnce(s, D_FILM, IRIS_FILM);
      s = insertAfter(s, G_COLOR, IRIS_TINT);
      s = insertAfter(s, ORG_FN, HUE_FN);
      s = replaceOnce(s, H_CLAMP, IRIS_CLAMP);
      break;
    case "neon":
      s = insertAfter(s, G_COLOR, NEON_GLOW);
      s = replaceOnce(s, H_CLAMP, NEON_CLAMP);
      break;
  }
  switch (stages.reveal) {
    case "dissolve":
      s = replaceOnce(s, F_MASK, DISSOLVE_MASK);
      break;
    case "scan":
      s = replaceOnce(s, F_MASK, SCAN_MASK);
      break;
    case "threshold":
      s = replaceOnce(s, F_MASK, THRESHOLD_MASK);
      break;
    case "edge":
      s = insertAfter(s, G_COLOR, EDGE_GLOW_INSERT);
      break;
  }
  return s;
}

const SHADER_CACHE = new Map();
function getShader(stages, palette) {
  const base = PALETTE_SHADERS[palette];
  const key =
    "C:" +
    stages.texture + "|" + stages.structure + "|" + stages.drive + "|" + stages.material + "|" + stages.reveal +
    "|" +
    palette;
  let shader = SHADER_CACHE.get(key);
  if (!shader) {
    shader = buildCustomShader(base, stages);
    SHADER_CACHE.set(key, shader);
  }
  return shader;
}


const DEFAULTS = {
  title: "SPECTRA",
  amount: "$128.00",
  status: "PAID",
  scale: 1.25,
  radius: 0,
  speed: 1.25,
  intensity: 1.65,
  fluidScale: 1.25,
  softness: 0.34,
  detail: 1,
  texDensity: 1,
  edgeSharp: 1,
  seed: 0,
  ditherAmount: 1,
  ditherMode: 3,
  ditherMatrix: 4,
  ditherPixel: 8,
  ditherDensity: 1,
  ditherBias: 0,
  stages: { texture: "fbm", structure: "none", drive: "standard", material: "palette", reveal: "linear" },
  interactive: true,
  palette: "ocean",
  panelOpen: true,
  galleryOpen: false,
  paused: false,
  demoPointer: false,
  locks: { palette: false, motion: false, texture: false, structure: false },
  snapshots: [],
};

function Toggle({ label, value, onChange }) {
  return h(
    "label",
    { className: "ctl-row" },
    h("span", { className: "ctl-label" }, label),
    h("input", {
      type: "checkbox",
      checked: value,
      onChange: (ev) => onChange(ev.target.checked),
    })
  );
}

function Slider({ label, value, min, max, step, onChange, format, hint }) {
  return h("label", { className: "ctl-row" },
    h("span", { className: "ctl-label" }, label),
    h("span", { className: "ctl-slider-wrap" },
      h("input", { type: "range", min: min, max: max, step: step, value: value, onChange: (ev) => onChange(Number(ev.target.value)) }),
      hint
        ? h("span", { className: "ctl-slider-hint" }, h("span", null, hint[0]), h("span", null, hint[1]))
        : null
    ),
    h("span", { className: "ctl-value ctl-value-weak" }, format ? format(value) : String(value))
  );
}

function OptionSelect({ label, value, options, onChange, disabled }) {
  return h("label", { className: "ctl-row" + (disabled ? " ctl-disabled" : "") },
    h("span", { className: "ctl-label" }, label),
    h("select", { value: value, disabled: !!disabled, onChange: (ev) => onChange(ev.target.value) },
      options.map((opt) => h("option", { value: opt.value, key: opt.value }, opt.label))
    )
  );
}

const WALL_ACCENTS = {
  ocean: "#396ff5",
  original: "#f05a7c",
  klein: "#ff5a1f",
  "violet-lime": "#613dc1",
  chrome: "#59606d",
  plus: "#ff214f",
  qinghua: "#2456a3",
  zhusha: "#c3272b",
  shanqing: "#2fa8a0",
  yanzhi: "#a02833",
  liujin: "#c27e2a",
  shuimo: "#33302b",
};

function SnapshotWall({ items, columns, cellWidth, cellHeight, gap, onRestore, onDelete }) {
  const containerRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const pointerRef = React.useRef({ index: -1, x: 0.5, y: 0.5, hover: 0 });
  React.useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas || !items.length) return;
    const gl = canvas.getContext("webgl", { antialias: true, alpha: false, powerPreference: "high-performance" });
    if (!gl) return;
    const cols = Math.max(1, columns || 2);
    const cw = cellWidth || 300;
    const ch = cellHeight || 400;
    const gp = gap || 18;
    const rows = Math.ceil(items.length / cols);
    const W = cols * cw + (cols - 1) * gp;
    const H = rows * ch + (rows - 1) * gp;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    canvas.style.width = W + "px";
    canvas.style.height = H + "px";
    const VSS =
      "attribute vec2 position;" +
      "varying vec2 vUv;" +
      "void main(){vUv=position*0.5+0.5;gl_Position=vec4(position,0.0,1.0);}";
    const compile = (type, src) => {
      const sh = gl.createShader(type);
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        gl.deleteShader(sh);
        return null;
      }
      return sh;
    };
    const cells = [];
    for (let i = 0; i < items.length; i++) {
      const st = items[i].state || {};
      const col = i % cols;
      const row = Math.floor(i / cols);
      const px = col * (cw + gp);
      const py = row * (ch + gp);
      const src = getShader(st.stages, st.palette);
      const vs = compile(gl.VERTEX_SHADER, VSS);
      const fs = compile(gl.FRAGMENT_SHADER, src);
      if (!vs || !fs) {
        if (vs) gl.deleteShader(vs);
        if (fs) gl.deleteShader(fs);
        continue;
      }
      const prog = gl.createProgram();
      gl.attachShader(prog, vs);
      gl.attachShader(prog, fs);
      gl.linkProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
        gl.deleteProgram(prog);
        continue;
      }
      const buf = gl.createBuffer();
      const nx0 = px / W * 2 - 1;
      const nx1 = (px + cw) / W * 2 - 1;
      const ny1 = 1 - py / H * 2;
      const ny0 = 1 - (py + ch) / H * 2;
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([nx0, ny0, nx1, ny0, nx0, ny1, nx1, ny1, nx0, ny1, nx1, ny0]),
        gl.STATIC_DRAW
      );
      const u = (name) => gl.getUniformLocation(prog, name);
      cells.push({
        index: i,
        program: prog,
        buffer: buf,
        posLoc: gl.getAttribLocation(prog, "position"),
        uTime: u("uTime"),
        uResolution: u("uResolution"),
        uPointer: u("uPointer"),
        uHover: u("uHover"),
        uSpeed: u("uSpeed"),
        uIntensity: u("uIntensity"),
        uFluidScale: u("uFluidScale"),
        uSoftness: u("uSoftness"),
        uDetail: u("uDetail"),
        uTexDensity: u("uTexDensity"),
        uEdge: u("uEdge"),
        uSeed: u("uSeed"),
        uDitherAmount: u("uDitherAmount"),
        uDitherMode: u("uDitherMode"),
        uDitherMatrix: u("uDitherMatrix"),
        uDitherPixel: u("uDitherPixel"),
        uDitherDensity: u("uDitherDensity"),
        uDitherBias: u("uDitherBias"),
        uDpr: u("uDpr"),
        view: [Math.round(px * dpr), Math.round((H - py - ch) * dpr), Math.round(cw * dpr), Math.round(ch * dpr)],
        speed: st.speed || 0,
        intensity: st.intensity || 0,
        fluidScale: st.fluidScale || 0,
        softness: st.softness || 0,
        detail: st.detail || 0,
        texDensity: st.texDensity || 0,
        edgeSharp: st.edgeSharp || 0,
        seed: st.seed || 0,
        ditherAmount: st.ditherAmount === undefined ? 1 : st.ditherAmount,
        ditherMode: st.ditherMode === undefined ? 1 : st.ditherMode,
        ditherMatrix: st.ditherMatrix === undefined ? 4 : st.ditherMatrix,
        ditherPixel: st.ditherPixel === undefined ? 1 : st.ditherPixel,
        ditherDensity: st.ditherDensity === undefined ? 1 : st.ditherDensity,
        ditherBias: st.ditherBias === undefined ? 0 : st.ditherBias,
      });
    }
    if (!cells.length) return;
    const pointer = pointerRef.current;
    let raf = 0;
    const start = performance.now();
    const tick = () => {
      const t = (performance.now() - start) / 1000;
      gl.disable(gl.SCISSOR_TEST);
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.clearColor(1, 1, 1, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      for (const c of cells) {
        gl.useProgram(c.program);
        gl.enable(gl.SCISSOR_TEST);
        gl.scissor(c.view[0], c.view[1], c.view[2], c.view[3]);
        gl.viewport(c.view[0], c.view[1], c.view[2], c.view[3]);
        if (c.uTime) gl.uniform1f(c.uTime, t);
        if (c.uResolution) gl.uniform2f(c.uResolution, c.view[2], c.view[3]);
        const active = pointer.index === c.index;
        if (c.uPointer) gl.uniform2f(c.uPointer, active ? pointer.x : 0.5, active ? pointer.y : 0.5);
        if (c.uHover) gl.uniform1f(c.uHover, active ? Math.min(1, pointer.hover) : 0);
        if (c.uSpeed) gl.uniform1f(c.uSpeed, c.speed);
        if (c.uIntensity) gl.uniform1f(c.uIntensity, c.intensity);
        if (c.uFluidScale) gl.uniform1f(c.uFluidScale, c.fluidScale);
        if (c.uSoftness) gl.uniform1f(c.uSoftness, c.softness);
        if (c.uDetail) gl.uniform1f(c.uDetail, c.detail);
        if (c.uTexDensity) gl.uniform1f(c.uTexDensity, c.texDensity);
        if (c.uEdge) gl.uniform1f(c.uEdge, c.edgeSharp);
        if (c.uSeed) gl.uniform1f(c.uSeed, c.seed);
        if (c.uDitherAmount) gl.uniform1f(c.uDitherAmount, c.ditherAmount);
        if (c.uDitherMode) gl.uniform1f(c.uDitherMode, c.ditherMode);
        if (c.uDitherMatrix) gl.uniform1f(c.uDitherMatrix, c.ditherMatrix);
        if (c.uDitherPixel) gl.uniform1f(c.uDitherPixel, c.ditherPixel);
        if (c.uDitherDensity) gl.uniform1f(c.uDitherDensity, c.ditherDensity);
        if (c.uDitherBias) gl.uniform1f(c.uDitherBias, c.ditherBias);
        if (c.uDpr) gl.uniform1f(c.uDpr, dpr);
        gl.bindBuffer(gl.ARRAY_BUFFER, c.buffer);
        gl.enableVertexAttribArray(c.posLoc);
        gl.vertexAttribPointer(c.posLoc, 2, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        gl.disableVertexAttribArray(c.posLoc);
      }
      gl.disable(gl.SCISSOR_TEST);
      raf = window.requestAnimationFrame(tick);
    };
    raf = window.requestAnimationFrame(tick);
    const onMove = (ev) => {
      const r = container.getBoundingClientRect();
      const x = ev.clientX - r.left;
      const y = ev.clientY - r.top;
      const col = Math.floor(x / (cw + gp));
      const row = Math.floor(y / (ch + gp));
      const idx = row * cols + col;
      if (
        idx >= 0 &&
        idx < items.length &&
        x >= col * (cw + gp) &&
        x <= col * (cw + gp) + cw &&
        y >= row * (ch + gp) &&
        y <= row * (ch + gp) + ch
      ) {
        pointer.index = idx;
        pointer.x = Math.min(1, Math.max(0, (x - col * (cw + gp)) / cw));
        pointer.y = Math.min(1, Math.max(0, 1 - (y - row * (ch + gp)) / ch));
        pointer.hover = Math.min(1, pointer.hover + 0.08);
      } else if (pointer.index === idx) {
        pointer.index = -1;
        pointer.hover = 0;
      }
    };
    const onLeave = () => {
      pointer.index = -1;
      pointer.hover = 0;
    };
    container.addEventListener("pointermove", onMove);
    container.addEventListener("pointerleave", onLeave);
    return () => {
      window.cancelAnimationFrame(raf);
      container.removeEventListener("pointermove", onMove);
      container.removeEventListener("pointerleave", onLeave);
      for (const c of cells) {
        gl.deleteBuffer(c.buffer);
        gl.deleteProgram(c.program);
      }
      const ext = gl.getExtension("WEBGL_lose_context");
      if (ext) ext.loseContext();
      canvas.width = 0;
      canvas.height = 0;
    };
  }, [items, columns, cellWidth, cellHeight, gap]);
  const cols = Math.max(1, columns || 2);
  const cw = cellWidth || 300;
  const ch = cellHeight || 400;
  const gp = gap || 18;
  const rows = Math.ceil(items.length / cols);
  const W = cols * cw + (cols - 1) * gp;
  const H = rows * ch + (rows - 1) * gp;
  const cells = items.map((sn, i) => {
    const st = sn.state || {};
    const col = i % cols;
    const row = Math.floor(i / cols);
    return h("div", {
      key: sn.id,
      className: "wall-cell",
      style: {
        left: col * (cw + gp) + "px",
        top: row * (ch + gp) + "px",
        width: cw + "px",
        height: ch + "px",
        "--spectra-accent": WALL_ACCENTS[st.palette] || "#396ff5",
      },
    },
      h("div", { className: "spectra-card-left-protection" }),
      h("div", { className: "spectra-card-content" },
        h("div", { className: "spectra-card-title" }, st.title || "SPECTRA"),
        h("div", { className: "spectra-card-amount" }, st.amount || "$128.00"),
        h("div", { className: "spectra-card-status" }, st.status || "PAID")
      ),
      h("div", { className: "wall-cell-foot" },
        h("span", { className: "wall-cell-name" }, sn.name),
        h("span", { className: "wall-cell-meta" },
          "配色 " + paletteLabel(st.palette) +
          " · 纹理 " + optLabel(TEXTURE_OPTIONS, st.stages && st.stages.texture) +
          " · 结构 " + optLabel(STRUCTURE_OPTIONS, st.stages && st.stages.structure) +
          " · 驱动 " + optLabel(DRIVE_OPTIONS, st.stages && st.stages.drive) +
          " · 材质 " + optLabel(MATERIAL_OPTIONS, st.stages && st.stages.material) +
          " · 显形 " + optLabel(REVEAL_OPTIONS, st.stages && st.stages.reveal)
        ),
        h("div", { className: "wall-cell-actions" },
          h("button", { className: "sg-restore", onClick: () => onRestore && onRestore(sn) }, "恢复"),
          h("button", { className: "sg-del", onClick: () => onDelete && onDelete(sn.id) }, "删除")
        )
      )
    );
  });
  return h("div", { ref: containerRef, className: "wall", style: { width: W + "px", height: H + "px" } },
    h("canvas", { ref: canvasRef, className: "wall-canvas" }),
    cells
  );
}

function App() {
  const [state, setStateRaw] = React.useState(DEFAULTS);
  const historyRef = React.useRef({ past: [], future: [], lastKind: "", lastTime: 0 });
  const stateRef = React.useRef(state);
  stateRef.current = state;
  const demoRef = React.useRef(null);

  const update = (kind, updater) => {
    setStateRaw((s) => {
      const next = typeof updater === "function" ? updater(s) : updater;
      const h = historyRef.current;
      const now = Date.now();
      if (h.lastKind === kind && now - h.lastTime < 500 && h.past.length) {
        h.past[h.past.length - 1] = s;
      } else {
        h.past.push(s);
        if (h.past.length > 20) h.past.shift();
      }
      h.future = [];
      h.lastKind = kind;
      h.lastTime = now;
      return next;
    });
  };

  const set = (key) => (value) => update("param", (s) => Object.assign({}, s, { [key]: value }));
  const setStage = (key) => (value) =>
    update("stage", (s) => Object.assign({}, s, { stages: Object.assign({}, s.stages, { [key]: value }) }));
  const toggleLock = (key) =>
    update("lock", (s) => Object.assign({}, s, { locks: Object.assign({}, s.locks, { [key]: !s.locks[key] }) }));

  const undo = () => {
    const h = historyRef.current;
    if (!h.past.length) return;
    const prev = h.past.pop();
    h.future.push(stateRef.current);
    setStateRaw(prev);
  };
  const redo = () => {
    const h = historyRef.current;
    if (!h.future.length) return;
    const next = h.future.pop();
    h.past.push(stateRef.current);
    setStateRaw(next);
  };
  const reset = () => update("reset", () => DEFAULTS);

  const saveSnapshot = () =>
    update("snapshot", (s) => {
      const snap = {
        id: Date.now(),
        name: "快照 " + (s.snapshots.length + 1),
        state: {
          title: s.title, amount: s.amount, status: s.status,
          scale: s.scale, radius: s.radius, speed: s.speed, intensity: s.intensity,
          fluidScale: s.fluidScale, softness: s.softness, detail: s.detail,
          texDensity: s.texDensity, edgeSharp: s.edgeSharp, seed: s.seed,
          ditherAmount: s.ditherAmount,
          ditherMode: s.ditherMode,
          ditherMatrix: s.ditherMatrix,
          ditherPixel: s.ditherPixel,
          ditherDensity: s.ditherDensity,
          ditherBias: s.ditherBias,
          stages: Object.assign({}, s.stages),
          interactive: s.interactive, palette: s.palette,
        },
      };
      return Object.assign({}, s, { snapshots: s.snapshots.concat([snap]).slice(-6) });
    });
  const restoreSnapshot = (snap) => update("snapshot", (s) => Object.assign({}, s, snap.state));
  const deleteSnapshot = (id) =>
    update("snapshot", (s) => Object.assign({}, s, { snapshots: s.snapshots.filter((x) => x.id !== id) }));

  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const rnd = (min, max, step) => {
    const v = min + Math.random() * (max - min);
    return Math.round(v / step) * step;
  };
  const randomize = () =>
    update("random", (s) => {
      const n = Object.assign({}, s, { stages: Object.assign({}, s.stages) });
      if (!s.locks.texture) n.stages.texture = pick(TEXTURE_OPTIONS).value;
      if (!s.locks.structure) n.stages.structure = pick(STRUCTURE_OPTIONS).value;
      n.stages.drive = pick(DRIVE_OPTIONS).value;
      n.stages.material = pick(MATERIAL_OPTIONS).value;
      n.stages.reveal = pick(REVEAL_OPTIONS).value;
      if (!s.locks.palette) n.palette = pick(PALETTES).value;
      if (!s.locks.motion) {
        n.speed = rnd(0.4, 2.5, 0.05);
        n.intensity = rnd(0.8, 2.2, 0.01);
        n.fluidScale = rnd(0.8, 2.2, 0.05);
        n.softness = rnd(0.18, 0.5, 0.01);
        n.detail = rnd(0.6, 1.8, 0.05);
      }
      if (!s.locks.texture) {
        n.texDensity = rnd(0.6, 1.8, 0.05);
        n.edgeSharp = rnd(0.85, 1.35, 0.05);
        n.seed = rnd(0, 6.28, 0.05);
        n.ditherAmount = rnd(0.4, 1, 0.05);
        n.ditherMode = Number(pick(DITHER_MODE_OPTIONS).value);
        n.ditherMatrix = pick(DITHER_MATRIX_OPTIONS).value;
        n.ditherPixel = rnd(3, 10, 0.5);
        n.ditherDensity = rnd(0.85, 1.15, 0.01);
        n.ditherBias = rnd(-0.1, 0.1, 0.01);
      }
      return n;
    });

  const fitCanvas = () => {
    const fs = Math.max(0.8, Math.min(1.5, Math.round(((window.innerHeight - 190) / 480) * 20) / 20));
    set("scale")(fs);
  };
  const toggleFullscreen = () => {
    if (document.fullscreenElement) document.exitFullscreen();
    else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
  };

  React.useEffect(() => {
    if (!state.demoPointer) return;
    const start = performance.now();
    const tick = () => {
      const el = document.querySelector(".spectra-card-shell");
      if (!el) return;
      const r = el.getBoundingClientRect();
      const t = (performance.now() - start) / 1000;
      const cx = r.left + r.width * (0.5 + 0.36 * Math.sin(t * 0.85));
      const cy = r.top + r.height * (0.5 + 0.3 * Math.cos(t * 1.25));
      el.dispatchEvent(new PointerEvent("pointermove", { bubbles: true, clientX: cx, clientY: cy }));
    };
    demoRef.current = window.setInterval(tick, 33);
    return () => {
      window.clearInterval(demoRef.current);
      demoRef.current = null;
      const el = document.querySelector(".spectra-card-shell");
      if (el) el.dispatchEvent(new PointerEvent("pointerleave", { bubbles: true }));
    };
  }, [state.demoPointer]);

  const blackbody = state.stages.material === "blackbody";
  const cardWidth = Math.round(360 * state.scale);
  const cardHeight = Math.round(480 * state.scale);

  const lockChip = (key, label) =>
    h("button", {
      key: key,
      className: "lock-chip" + (state.locks[key] ? " lock-chip-active" : ""),
      onClick: () => toggleLock(key),
      title: state.locks[key] ? "已锁定（随机时不变）" : "未锁定（随机时变化）",
    }, (state.locks[key] ? "🔒 " : "□ ") + label);

  const historyBlock = h("div", { className: "hist-block" },
    h("div", { className: "hist-row" },
      h("button", { className: "tb-btn", onClick: undo, title: "撤销（最近20步）" }, "↶ 撤销"),
      h("button", { className: "tb-btn", onClick: redo, title: "重做" }, "↷ 重做"),
      h("button", { className: "tb-btn", onClick: saveSnapshot }, "＋ 快照"),
      h("button", { className: "tb-btn", onClick: () => setStateRaw((s) => Object.assign({}, s, { galleryOpen: true })), title: "把所有快照放到同一页查看" }, "◫ 快照页")
    ),
    state.snapshots.length
      ? h("div", { className: "snap-row" },
          state.snapshots.map((sn) =>
            h("span", { key: sn.id, className: "snap-chip" },
              sn.name,
              h("button", { className: "snap-restore", onClick: () => restoreSnapshot(sn) }, "恢复"),
              h("button", { className: "snap-del", onClick: () => deleteSnapshot(sn.id) }, "×")
            )
          )
        )
      : null,
    h("div", { className: "random-row" },
      h("button", { className: "random-btn", onClick: randomize }, "✨ 换一个效果"),
      h("span", { className: "lock-label" }, "锁定"),
      lockChip("palette", "配色"),
      lockChip("motion", "动态"),
      lockChip("texture", "纹理"),
      lockChip("structure", "结构")
    )
  );

  const coreSliders = h("div", null,
    Slider({ label: "动态速度", value: state.speed, min: 0, max: 3, step: 0.05, onChange: set("speed"), format: (v) => v.toFixed(2), hint: ["舒缓", "快速"] }),
    Slider({ label: "动态强度", value: state.intensity, min: 0.3, max: 2.4, step: 0.01, onChange: set("intensity"), format: (v) => v.toFixed(2), hint: ["轻柔", "强烈"] }),
    Slider({ label: "纹理大小", value: state.fluidScale, min: 0.5, max: 3, step: 0.05, onChange: set("fluidScale"), format: (v) => v.toFixed(2), hint: ["细腻", "粗犷"] }),
    Slider({ label: "柔和度", value: state.softness, min: 0.15, max: 0.6, step: 0.01, onChange: set("softness"), format: (v) => v.toFixed(2), hint: ["柔和", "清晰"] }),
    Slider({ label: "画面复杂度", value: state.detail, min: 0.4, max: 2, step: 0.05, onChange: set("detail"), format: (v) => v.toFixed(2), hint: ["简约", "丰富"] })
  );

  const paletteRow = h("div", null,
    OptionSelect({ label: "配色", value: state.palette, options: PALETTES, onChange: set("palette"), disabled: blackbody }),
    blackbody ? h("div", { className: "ctl-hint" }, "黑体热力：颜色由温度场驱动，配色暂不生效") : null
  );

  const stageControls = h("div", null,
    OptionSelect({ label: "基础纹理", value: state.stages.texture, options: TEXTURE_OPTIONS, onChange: setStage("texture") }),
    h("div", { className: "ctl-sub" }, "基础纹理·二级参数"),
    Slider({ label: "纹理密度", value: state.texDensity, min: 0.5, max: 2, step: 0.05, onChange: set("texDensity"), format: (v) => v.toFixed(2), hint: ["稀疏", "密集"] }),
    Slider({ label: "细节层级", value: state.detail, min: 0.4, max: 2, step: 0.05, onChange: set("detail"), format: (v) => v.toFixed(2), hint: ["简约", "丰富"] }),
    Slider({ label: "边缘锐度", value: state.edgeSharp, min: 0.7, max: 1.6, step: 0.05, onChange: set("edgeSharp"), format: (v) => v.toFixed(2), hint: ["柔和", "锐利"] }),
    Slider({ label: "随机种子", value: state.seed, min: 0, max: 6.28, step: 0.05, onChange: set("seed"), format: (v) => Math.round((v / Math.PI) * 180) + "°" }),
    OptionSelect({ label: "空间结构", value: state.stages.structure, options: STRUCTURE_OPTIONS, onChange: setStage("structure") }),
    OptionSelect({ label: "动态驱动", value: state.stages.drive, options: DRIVE_OPTIONS, onChange: setStage("drive") }),
    OptionSelect({ label: "颜色材质", value: state.stages.material, options: MATERIAL_OPTIONS, onChange: setStage("material") }),
    OptionSelect({ label: "显形输出", value: state.stages.reveal, options: REVEAL_OPTIONS, onChange: setStage("reveal") })
  );

  const group = (title, ...children) =>
    h("div", { className: "ctl-group" },
      h("div", { className: "ctl-section" }, title),
      ...children
    );

  const panelContent = h("div", null,
    group("参数",
    Slider({ label: "尺寸", value: state.scale, min: 0.6, max: 1.5, step: 0.05, onChange: set("scale"), format: (v) => Math.round(360 * v) + "×" + Math.round(480 * v) }),
    Slider({ label: "圆角", value: state.radius, min: 0, max: 64, step: 1, onChange: set("radius"), format: (v) => v + "px" }),
    coreSliders
    ),
    group("抖动 Dither",
    Slider({ label: "抖动 Dither", value: state.ditherAmount, min: 0, max: 1, step: 0.01, onChange: set("ditherAmount"), format: (v) => v.toFixed(2), hint: ["无", "点阵"] }),
    h("div", { className: "ctl-sub" }, "Dither 参数"),
    OptionSelect({ label: "抖动方式", value: String(state.ditherMode), options: DITHER_MODE_OPTIONS, onChange: (v) => set("ditherMode")(Number(v)) }),
    OptionSelect({ label: "抖动矩阵", value: String(state.ditherMatrix), options: DITHER_MATRIX_OPTIONS, onChange: (v) => set("ditherMatrix")(Number(v)) }),
    Slider({ label: "颗粒尺寸", value: state.ditherPixel, min: 1, max: 12, step: 0.5, onChange: set("ditherPixel"), format: (v) => v.toFixed(1) + "px", hint: ["细", "粗"] }),
    Slider({ label: "密度增益", value: state.ditherDensity, min: 0.8, max: 1.25, step: 0.01, onChange: set("ditherDensity"), format: (v) => v.toFixed(2), hint: ["稀疏", "饱满"] }),
    Slider({ label: "阈值偏移", value: state.ditherBias, min: -0.2, max: 0.2, step: 0.01, onChange: set("ditherBias"), format: (v) => v.toFixed(2), hint: ["收", "放"] })
    ),
    group("生成管线", stageControls),
    group("外观",
    Toggle({ label: "鼠标交互", value: state.interactive, onChange: set("interactive") }),
    paletteRow
    ),
    group("历史与随机", historyBlock)
  );

  const closeGallery = () => setStateRaw((s) => Object.assign({}, s, { galleryOpen: false }));
  const galleryOverlay = h("div", { className: "snap-gallery" },
    h("div", { className: "snap-gallery-head" },
      h("span", { className: "snap-gallery-title" },
        "快照画廊" + (state.snapshots.length ? "（" + state.snapshots.length + "）" : "")
      ),
      h("button", { className: "snap-gallery-close", onClick: closeGallery }, "✕ 返回")
    ),
    h("div", { className: "snap-gallery-hint" }, "所有快照的动画都在同一个画布里实时播放 · 鼠标划过可交互预览"),
    state.snapshots.length
      ? h(SnapshotWall, {
          items: state.snapshots,
          columns: 2,
          cellWidth: 300,
          cellHeight: 400,
          gap: 18,
          onRestore: (sn) => { restoreSnapshot(sn); closeGallery(); },
          onDelete: (id) => deleteSnapshot(id),
        })
      : h("div", { className: "snap-gallery-empty" }, "还没有快照 · 在右侧面板点“＋ 快照”保存当前效果")
  );

  return h("main", { className: "app app-controls" + (state.panelOpen ? "" : " panel-closed") },
    h("div", { className: "canvas-area" },
      h("div", { className: "canvas-toolbar" },
        h("button", { className: "tb-btn", onClick: fitCanvas, title: "自适应视口高度" }, "适应画布"),
        h("button", { className: "tb-btn", onClick: () => set("scale")(1), title: "设计尺寸 100%（360×480）" }, "100%"),
        h("button", { className: "tb-btn" + (state.paused ? " tb-active" : ""), onClick: () => set("paused")(!state.paused) }, state.paused ? "▶ 播放" : "⏸ 暂停"),
        h("button", { className: "tb-btn" + (state.demoPointer ? " tb-active" : ""), onClick: () => set("demoPointer")(!state.demoPointer) }, "交互预览"),
        h("button", { className: "tb-btn", onClick: toggleFullscreen }, "⛶ 全屏"),
        h("span", { className: "tb-sep" }),
        h("button", { className: "tb-btn", onClick: () => set("scale")(0.7) }, "手机"),
        h("button", { className: "tb-btn", onClick: () => set("scale")(0.95) }, "平板"),
        h("button", { className: "tb-btn", onClick: () => set("scale")(1.25) }, "桌面"),
        h("button", { className: "tb-btn", onClick: () => set("scale")(1) }, "原始")
      ),
      h("div", { className: "spectra-stage", style: { "--spectra-card-radius": state.radius + "px" } },
        h(SpectraCard, {
          title: state.title,
          amount: state.amount,
          status: state.status,
          width: cardWidth,
          height: cardHeight,
          speed: state.paused ? 0 : state.speed,
          intensity: state.intensity,
          fluidScale: state.fluidScale,
          softness: state.softness,
          detail: state.detail,
          texDensity: state.texDensity,
          edgeSharp: state.edgeSharp,
          seed: state.seed,
          ditherAmount: state.ditherAmount,
          ditherMode: state.ditherMode,
          ditherMatrix: state.ditherMatrix,
          ditherPixel: state.ditherPixel,
          ditherDensity: state.ditherDensity,
          ditherBias: state.ditherBias,
          interactive: state.interactive,
          palette: state.palette,
          shaderSource: getShader(state.stages, state.palette),
        })
      )
    ),
    h("button", {
      className: "panel-toggle",
      title: state.panelOpen ? "收起控制" : "展开控制",
      onClick: () => setStateRaw((s) => Object.assign({}, s, { panelOpen: !s.panelOpen })),
    }, state.panelOpen ? "»" : "«"),
    state.panelOpen
      ? h("aside", { className: "spectra-panel" }, panelContent)
      : null,
    state.galleryOpen ? galleryOverlay : null
  );
}


ReactDOM.createRoot(document.getElementById("root")).render(
  e.jsx(React.StrictMode, { children: e.jsx(App, {}) })
);
