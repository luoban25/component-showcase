(function (global) {
  "use strict";

  var THEMES = global.FluidProgressThemes || {};
  var instances = new WeakMap();

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function finiteNumber(value, fallback) {
    if (typeof value === "string" && value.trim() === "") return fallback;
    var parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function progressValue(value, fallback) {
    return clamp(finiteNumber(value, fallback), 0, 100);
  }

  function unitValue(value, fallback) {
    return clamp(finiteNumber(value, fallback), 0, 1);
  }

  function numberAttr(element, name, fallback) {
    var raw = element.getAttribute(name);
    if (raw === null || raw.trim() === "") return fallback;
    return finiteNumber(raw, fallback);
  }

  function boolAttr(element, name, fallback) {
    var value = element.getAttribute(name);
    if (value === null) return fallback;
    return value !== "false";
  }

  function sparkMarkup(count) {
    var markup = ['<div class="fpc-sparks" aria-hidden="true">'];
    for (var i = 0; i < count; i++) markup.push('<i class="fpc-spark"></i>');
    markup.push("</div>");
    return markup.join("");
  }

  function cssRgb(color) {
    return "rgb(" + color.map(function (channel) { return Math.round(channel * 255); }).join(",") + ")";
  }

  function FluidProgressCard(root, options) {
    if (!root) throw new Error("FluidProgress: root element is required.");
    if (instances.has(root)) return instances.get(root);

    options = options || {};
    var themeNames = Object.keys(THEMES);
    if (!themeNames.length) {
      throw new Error("FluidProgress: load fluid-progress-themes.js before fluid-progress.js.");
    }

    this.root = root;
    var requestedTheme = options.theme !== undefined ? String(options.theme) : root.getAttribute("data-theme");
    this.themeName = THEMES[requestedTheme] ? requestedTheme : (THEMES["coral-magenta"] ? "coral-magenta" : themeNames[0]);
    this.title = options.title !== undefined ? String(options.title) : (root.getAttribute("data-title") || "NEURAL SYNC");
    this.subtitle = options.subtitle !== undefined ? String(options.subtitle) : (root.getAttribute("data-subtitle") || "ADAPTIVE INFERENCE STREAM");
    this.hasCustomAriaLabel = options.ariaLabel !== undefined || root.hasAttribute("data-aria-label");
    this.ariaLabel = options.ariaLabel !== undefined
      ? String(options.ariaLabel)
      : (root.getAttribute("data-aria-label") || this.title || "Progress");
    this.draggable = options.draggable !== undefined ? Boolean(options.draggable) : boolAttr(root, "data-draggable", true);
    this.step = Math.max(0.1, finiteNumber(options.step !== undefined ? options.step : numberAttr(root, "data-step", 1), 1));
    this.effects = {
      stir: unitValue(options.stir !== undefined ? options.stir : numberAttr(root, "data-stir", 0), 0),
      delay: unitValue(options.delay !== undefined ? options.delay : numberAttr(root, "data-delay", 0), 0),
      echo: unitValue(options.echo !== undefined ? options.echo : numberAttr(root, "data-echo", 0), 0),
      spark: unitValue(options.spark !== undefined ? options.spark : numberAttr(root, "data-spark", 0), 0)
    };
    var initialProgress = progressValue(
      options.progress !== undefined ? options.progress : numberAttr(root, "data-progress", 64),
      64
    );
    this.state = {
      current: initialProgress / 100,
      target: 0,
      velocity: 0,
      impulse: 0,
      echo1: initialProgress / 100,
      echo2: initialProgress / 100,
      stirEnergy: 0,
      sparkEnergy: 0,
      pointerY: 0.5,
      dragging: false,
      pointerId: null,
      settled: true
    };
    this.state.target = this.state.current;
    this.destroyed = false;
    this.raf = 0;
    this.previousTime = performance.now();
    this.startTime = this.previousTime;
    this.renderer = null;
    this.pageVisible = !document.hidden;
    this.inViewport = true;
    this.reducedMotion = false;
    this.lastPercent = null;
    this.lastAriaValue = null;
    this.lastSparkX = null;
    this.lastSparkOpacity = null;
    this.layoutSize = { width: 0, height: 0 };
    this.intersectionObserver = null;
    this.resizeObserver = null;
    this.motionQuery = null;

    this._build();
    this._bind();
    this._start();
    instances.set(root, this);
  }

  FluidProgressCard.prototype._build = function () {
    this.root.classList.add("fpc-card");
    this.root.setAttribute("data-draggable", String(this.draggable));
    this.root.setAttribute("data-theme", this.themeName);
    this.root.setAttribute("data-stir", String(this.effects.stir));
    this.root.setAttribute("data-delay", String(this.effects.delay));
    this.root.setAttribute("data-echo", String(this.effects.echo));
    this.root.setAttribute("data-spark", String(this.effects.spark));
    this.root.innerHTML = [
      '<canvas class="fpc-render-layer fpc-webgl-canvas" aria-hidden="true"></canvas>',
      '<canvas class="fpc-render-layer fpc-fallback-canvas" aria-hidden="true"></canvas>',
      this.effects.spark > 0 ? sparkMarkup(12) : "",
      '<div class="fpc-content">',
        '<div class="fpc-copy">',
          '<h2 class="fpc-title"></h2>',
          '<p class="fpc-subtitle"></p>',
        '</div>',
        '<div class="fpc-percent" aria-hidden="true">',
          '<span class="fpc-percent-value"></span>',
          '<span class="fpc-percent-sign">%</span>',
        '</div>',
      '</div>'
    ].join("");

    this.webglCanvas = this.root.querySelector(".fpc-webgl-canvas");
    this.fallbackCanvas = this.root.querySelector(".fpc-fallback-canvas");
    this.sparksElement = this.root.querySelector(".fpc-sparks");
    this.titleElement = this.root.querySelector(".fpc-title");
    this.subtitleElement = this.root.querySelector(".fpc-subtitle");
    this.percentElement = this.root.querySelector(".fpc-percent-value");
    this.titleElement.textContent = this.title;
    this.subtitleElement.textContent = this.subtitle;
    var rect = this.root.getBoundingClientRect();
    this.layoutSize.width = rect.width;
    this.layoutSize.height = rect.height;
    this._syncSparkColor();
    this._syncInteractionSemantics();
    this._updatePercent(true);
  };

  FluidProgressCard.prototype._syncSparkColor = function () {
    if (!this.sparksElement) return;
    var theme = this._theme();
    this.sparksElement.style.setProperty("--fpc-spark-color", cssRgb(theme.color3));
    this.sparksElement.style.setProperty("--fpc-spark-core", cssRgb(theme.color4));
  };

  FluidProgressCard.prototype._ensureSparks = function () {
    if (this.sparksElement) return;
    var layer = document.createElement("div");
    layer.className = "fpc-sparks";
    layer.setAttribute("aria-hidden", "true");
    for (var i = 0; i < 12; i++) {
      var spark = document.createElement("i");
      spark.className = "fpc-spark";
      layer.appendChild(spark);
    }
    this.root.insertBefore(layer, this.root.querySelector(".fpc-content"));
    this.sparksElement = layer;
    this.lastSparkX = null;
    this.lastSparkOpacity = null;
    this._syncSparkColor();
  };

  FluidProgressCard.prototype._bind = function () {
    var self = this;

    this.onPointerDown = function (event) {
      if (!self.draggable) return;
      if (event.isPrimary === false) return;
      if (event.pointerType === "mouse" && event.button !== 0) return;
      event.preventDefault();
      try { self.root.focus({ preventScroll: true }); } catch (error) { self.root.focus(); }
      self.state.dragging = true;
      self.state.pointerId = event.pointerId;
      try { self.root.setPointerCapture(event.pointerId); } catch (error) {}
      self._setTargetFromPointer(event.clientX, event.clientY, true);
    };

    this.onPointerMove = function (event) {
      if (!self.draggable || !self.state.dragging || event.pointerId !== self.state.pointerId) return;
      event.preventDefault();
      self._setTargetFromPointer(event.clientX, event.clientY, true);
    };

    this.onPointerEnd = function (event) {
      if (self.state.pointerId !== null && event.pointerId !== self.state.pointerId) return;
      var wasDragging = self.state.dragging;
      try { self.root.releasePointerCapture(event.pointerId); } catch (error) {}
      self.state.dragging = false;
      self.state.pointerId = null;
      if (wasDragging) {
        self._emit("fluidprogresschange", "pointer");
        self._requestRender();
      }
    };

    this.onKeyDown = function (event) {
      if (!self.draggable) return;
      var value = self.state.target * 100;
      var handled = true;
      if (event.key === "ArrowLeft" || event.key === "ArrowDown") value -= self.step;
      else if (event.key === "ArrowRight" || event.key === "ArrowUp") value += self.step;
      else if (event.key === "PageDown") value -= self.step * 10;
      else if (event.key === "PageUp") value += self.step * 10;
      else if (event.key === "Home") value = 0;
      else if (event.key === "End") value = 100;
      else handled = false;

      if (!handled) return;
      event.preventDefault();
      if (self._setTargetNormalized(value / 100, "keyboard", true)) {
        self._emit("fluidprogresschange", "keyboard");
        self._requestRender();
      }
    };

    this.onVisibilityChange = function () {
      self.pageVisible = !document.hidden;
      self._syncAnimation();
    };

    this.onMotionChange = function (event) {
      self.reducedMotion = event.matches;
      self._syncAnimation();
    };

    this.root.addEventListener("pointerdown", this.onPointerDown);
    this.root.addEventListener("pointermove", this.onPointerMove);
    this.root.addEventListener("pointerup", this.onPointerEnd);
    this.root.addEventListener("pointercancel", this.onPointerEnd);
    this.root.addEventListener("keydown", this.onKeyDown);
    document.addEventListener("visibilitychange", this.onVisibilityChange);

    if (global.matchMedia) {
      this.motionQuery = global.matchMedia("(prefers-reduced-motion: reduce)");
      this.reducedMotion = this.motionQuery.matches;
      if (this.motionQuery.addEventListener) this.motionQuery.addEventListener("change", this.onMotionChange);
      else if (this.motionQuery.addListener) this.motionQuery.addListener(this.onMotionChange);
    }

    if (global.IntersectionObserver) {
      this.intersectionObserver = new IntersectionObserver(function (entries) {
        var entry = entries[entries.length - 1];
        self.inViewport = Boolean(entry && entry.isIntersecting && entry.intersectionRatio > 0);
        self._syncAnimation();
      }, { threshold: 0 });
      this.intersectionObserver.observe(this.root);
    }

    if (global.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(function (entries) {
        var entry = entries[entries.length - 1];
        if (!entry) return;
        self.layoutSize.width = entry.contentRect.width;
        self.layoutSize.height = entry.contentRect.height;
        self._updateSparks(true);
        self._requestRender();
      });
      this.resizeObserver.observe(this.root);
    }
  };

  FluidProgressCard.prototype._syncInteractionSemantics = function () {
    this.root.removeAttribute("aria-disabled");
    this.root.setAttribute("role", this.draggable ? "slider" : "progressbar");
    this.root.setAttribute("aria-label", this.ariaLabel);
    this.root.setAttribute("aria-valuemin", "0");
    this.root.setAttribute("aria-valuemax", "100");
    if (this.draggable) {
      this.root.setAttribute("tabindex", "0");
      this.root.setAttribute("aria-orientation", "horizontal");
    } else {
      this.root.removeAttribute("tabindex");
      this.root.removeAttribute("aria-orientation");
    }
    this._updateA11y(true);
  };

  FluidProgressCard.prototype._updateA11y = function (force) {
    var normalized = this.draggable ? this.state.target : this.state.current;
    var value = Math.round(clamp(normalized, 0, 1) * 100);
    if (!force && value === this.lastAriaValue) return;
    this.lastAriaValue = value;
    this.root.setAttribute("aria-valuenow", String(value));
    this.root.setAttribute("aria-valuetext", value + "%");
  };

  FluidProgressCard.prototype._emit = function (name, source) {
    this.root.dispatchEvent(new CustomEvent(name, {
      bubbles: true,
      detail: {
        value: this.state.target * 100,
        renderedValue: this.state.current * 100,
        source: source || "api"
      }
    }));
  };

  FluidProgressCard.prototype._setTargetNormalized = function (value, source, emitInput) {
    if (!Number.isFinite(value)) return false;
    var normalized = clamp(value, 0, 1);
    var changed = Math.abs(normalized - this.state.target) > 0.000001;
    this.state.target = normalized;
    this.state.settled = false;
    this._updateA11y();
    if (changed && emitInput) this._emit("fluidprogressinput", source);
    return changed;
  };

  FluidProgressCard.prototype._setTargetFromPointer = function (clientX, clientY, emitInput) {
    var rect = this.root.getBoundingClientRect();
    var normalized = clamp((clientX - rect.left) / Math.max(rect.width, 1), 0, 1);
    this.state.pointerY = clamp(1 - (clientY - rect.top) / Math.max(rect.height, 1), 0, 1);
    var changed = this._setTargetNormalized(normalized, "pointer", emitInput);
    this._requestRender();
    return changed;
  };

  FluidProgressCard.prototype._updatePhysics = function (dt) {
    var stiffness = 26;
    var damping = 9.5;
    var force = (this.state.target - this.state.current) * stiffness;

    this.state.velocity += force * dt;
    this.state.velocity *= Math.exp(-damping * dt);
    var next = this.state.current + this.state.velocity * dt;
    if ((next <= 0 && this.state.velocity < 0) || (next >= 1 && this.state.velocity > 0)) {
      this.state.velocity = 0;
    }
    this.state.current = clamp(next, 0, 1);

    var delta = Math.abs(this.state.target - this.state.current);
    this.state.impulse += (delta * 2.2 - this.state.impulse) * Math.min(1, dt * 5.2);

    var echoRate = 18 - this.effects.delay * 14;
    var echoAlpha1 = 1 - Math.exp(-echoRate * dt);
    var echoAlpha2 = 1 - Math.exp(-echoRate * 0.58 * dt);
    this.state.echo1 += (this.state.current - this.state.echo1) * echoAlpha1;
    this.state.echo2 += (this.state.echo1 - this.state.echo2) * echoAlpha2;

    var stirDrive = clamp(
      this.effects.stir * (Math.abs(this.state.velocity) * 8 + delta * 2.4 + (this.state.dragging ? 0.16 : 0)),
      0,
      1
    );
    var stirRate = stirDrive > this.state.stirEnergy ? 10 : 3.6;
    this.state.stirEnergy += (stirDrive - this.state.stirEnergy) * (1 - Math.exp(-stirRate * dt));

    var sparkDrive = this.effects.spark * clamp(
      Math.abs(this.state.velocity) * 11 + delta * 4.5 + (this.state.dragging ? 0.12 : 0),
      0,
      1
    );
    var sparkRate = sparkDrive > this.state.sparkEnergy ? 14 : 5.5;
    this.state.sparkEnergy += (sparkDrive - this.state.sparkEnergy) * (1 - Math.exp(-sparkRate * dt));

    if (!this.state.dragging && delta < 0.0005 && Math.abs(this.state.velocity) < 0.0005) {
      this.state.current = this.state.target;
      this.state.velocity = 0;
      this.state.impulse = 0;
      if (!this.state.settled) {
        this.state.settled = true;
        this._emit("fluidprogresssettled", "animation");
      }
    }
    this._updatePercent();
    this._updateSparks();
  };

  FluidProgressCard.prototype._updatePercent = function (force) {
    var percent = Math.round(this.state.current * 100);
    if (!Number.isFinite(percent)) percent = 0;
    if (!force && percent === this.lastPercent) return;
    this.lastPercent = percent;
    if (this.percentElement) this.percentElement.textContent = String(percent);
    if (!this.draggable) this._updateA11y();
  };

  FluidProgressCard.prototype._updateSparks = function (force) {
    if (!this.sparksElement) return;
    var width = Math.max(this.layoutSize.width, 1);
    var edgeX = clamp(this.state.current, 0, 1) * width;
    var opacity = this.reducedMotion ? 0 : clamp(this.state.sparkEnergy, 0, 1);
    if (force || this.lastSparkX === null || Math.abs(edgeX - this.lastSparkX) > 0.25) {
      this.lastSparkX = edgeX;
      this.sparksElement.style.transform = "translate3d(" + edgeX.toFixed(2) + "px,0,0)";
    }
    if (force || this.lastSparkOpacity === null || Math.abs(opacity - this.lastSparkOpacity) > 0.01) {
      this.lastSparkOpacity = opacity;
      this.sparksElement.style.opacity = opacity.toFixed(3);
      this.sparksElement.classList.toggle("fpc-sparks-active", opacity > 0.015);
    }
  };

  FluidProgressCard.prototype._theme = function () {
    return THEMES[this.themeName] || THEMES["coral-magenta"] || THEMES[Object.keys(THEMES)[0]];
  };

  FluidProgressCard.prototype._resizeCanvas = function (canvas, gl) {
    var cssWidth = this.layoutSize.width;
    var cssHeight = this.layoutSize.height;
    if (cssWidth <= 0 || cssHeight <= 0 || !global.ResizeObserver) {
      var rect = canvas.getBoundingClientRect();
      cssWidth = rect.width;
      cssHeight = rect.height;
      this.layoutSize.width = cssWidth;
      this.layoutSize.height = cssHeight;
    }
    var dpr = Math.min(global.devicePixelRatio || 1, 1.6);
    var width = Math.max(1, Math.round(cssWidth * dpr));
    var height = Math.max(1, Math.round(cssHeight * dpr));

    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
      if (gl) gl.viewport(0, 0, width, height);
    }
    return { width: width, height: height, cssWidth: cssWidth, cssHeight: cssHeight, dpr: dpr };
  };

  FluidProgressCard.prototype._start = function () {
    var self = this;
    this.onWebGLContextLost = function (event) {
      event.preventDefault();
      if (self.destroyed) return;
      self._useCanvasFallback(new Error("WebGL context lost."));
      self._requestRender();
    };
    this.onWebGLContextRestored = function () {
      if (self.destroyed) return;
      try {
        self.renderer = self._createWebGLRenderer();
        self.root.classList.remove("fpc-use-fallback");
      } catch (error) {
        self._useCanvasFallback(error);
      }
      self._requestRender();
    };
    this.webglCanvas.addEventListener("webglcontextlost", this.onWebGLContextLost, false);
    this.webglCanvas.addEventListener("webglcontextrestored", this.onWebGLContextRestored, false);

    try {
      this.renderer = this._createWebGLRenderer();
    } catch (error) {
      this._useCanvasFallback(error);
    }

    this.frame = function (now) {
      self.raf = 0;
      if (self.destroyed || !self.pageVisible || !self.inViewport || self.reducedMotion || !self.renderer) return;
      var dt = Math.min((now - self.previousTime) / 1000, 0.033);
      self.previousTime = now;
      self._updatePhysics(dt);
      self._renderOnce(now);
      self.raf = requestAnimationFrame(frame);
    };
    var frame = this.frame;
    this._syncAnimation();
  };

  FluidProgressCard.prototype._useCanvasFallback = function (error) {
    if (!this.root.classList.contains("fpc-use-fallback")) {
      console.warn("FluidProgress: WebGL unavailable, Canvas fallback enabled.", error);
    }
    this.root.classList.add("fpc-use-fallback");
    this.renderer = this._createCanvasRenderer();
  };

  FluidProgressCard.prototype._renderOnce = function (now) {
    if (!this.renderer || this.destroyed) return;
    try {
      this.renderer(now || performance.now());
    } catch (error) {
      if (!this.root.classList.contains("fpc-use-fallback")) {
        try {
          this._useCanvasFallback(error);
          this.renderer(now || performance.now());
        } catch (fallbackError) {
          console.error("FluidProgress: rendering failed.", fallbackError);
          this.renderer = null;
        }
      } else {
        console.error("FluidProgress: Canvas rendering failed.", error);
        this.renderer = null;
      }
    }
  };

  FluidProgressCard.prototype._renderReducedMotion = function () {
    var shouldEmit = !this.state.settled && !this.state.dragging;
    this.state.current = this.state.target;
    this.state.velocity = 0;
    this.state.impulse = 0;
    this.state.echo1 = this.state.current;
    this.state.echo2 = this.state.current;
    this.state.stirEnergy = 0;
    this.state.sparkEnergy = 0;
    this.state.settled = !this.state.dragging;
    this._updatePercent(true);
    this._updateA11y(true);
    this._updateSparks(true);
    this._renderOnce(performance.now());
    if (shouldEmit) this._emit("fluidprogresssettled", "reduced-motion");
  };

  FluidProgressCard.prototype._syncAnimation = function () {
    if (this.destroyed || !this.renderer) return;
    var shouldAnimate = this.pageVisible && this.inViewport && !this.reducedMotion;
    if (!shouldAnimate) {
      if (this.raf) cancelAnimationFrame(this.raf);
      this.raf = 0;
      if (this.sparksElement && !this.reducedMotion) {
        this.sparksElement.style.opacity = "0";
        this.sparksElement.classList.remove("fpc-sparks-active");
        this.lastSparkOpacity = 0;
      }
      if (this.reducedMotion && this.pageVisible && this.inViewport) this._renderReducedMotion();
      return;
    }
    if (!this.frame || this.raf) return;
    this.previousTime = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  };

  FluidProgressCard.prototype._requestRender = function () {
    if (!this.renderer || this.destroyed) return;
    if (this.reducedMotion && this.pageVisible && this.inViewport) this._renderReducedMotion();
    else this._syncAnimation();
  };

  FluidProgressCard.prototype._createWebGLRenderer = function () {
    var canvas = this.webglCanvas;
    var gl = canvas.getContext("webgl", {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      premultipliedAlpha: false,
      preserveDrawingBuffer: false,
      powerPreference: "high-performance"
    }) || canvas.getContext("experimental-webgl");

    if (!gl) throw new Error("WebGL context creation failed.");

    var vertexSource = [
      "attribute vec2 a_position;",
      "varying vec2 v_uv;",
      "void main(){",
      "  v_uv = a_position * 0.5 + 0.5;",
      "  gl_Position = vec4(a_position, 0.0, 1.0);",
      "}"
    ].join("\n");

    var fragmentSource = [
      "precision mediump float;",
      "varying vec2 v_uv;",
      "uniform vec2 u_resolution;",
      "uniform float u_time;",
      "uniform float u_progress;",
      "uniform float u_seed;",
      "uniform float u_velocity;",
      "uniform float u_impulse;",
      "uniform float u_stir;",
      "uniform float u_echo;",
      "uniform float u_echo1;",
      "uniform float u_echo2;",
      "uniform float u_pointerY;",
      "uniform vec3 u_darkRight;",
      "uniform vec3 u_darkLeft;",
      "uniform vec3 u_color0;",
      "uniform vec3 u_color1;",
      "uniform vec3 u_color2;",
      "uniform vec3 u_color3;",
      "uniform vec3 u_color4;",
      "float hash21(vec2 p){",
      "  p=fract(p*vec2(123.34,456.21));",
      "  p+=dot(p,p+vec2(45.32+u_seed));",
      "  return fract(p.x*p.y);",
      "}",
      "float noise2(vec2 p){",
      "  vec2 i=floor(p); vec2 f=fract(p); f=f*f*(3.0-2.0*f);",
      "  float a=hash21(i); float b=hash21(i+vec2(1.0,0.0));",
      "  float c=hash21(i+vec2(0.0,1.0)); float d=hash21(i+vec2(1.0,1.0));",
      "  return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);",
      "}",
      "float fbm(vec2 p){",
      "  float v=0.0; float a=0.5;",
      "  for(int i=0;i<4;i++){",
      "    v+=a*noise2(p);",
      "    p=mat2(0.80,0.60,-0.60,0.80)*p*2.01+vec2(7.1,13.7);",
      "    a*=0.5;",
      "  }",
      "  return v;",
      "}",
      "float sat(float x){return clamp(x,0.0,1.0);}",
      "void main(){",
      "  vec2 uv=v_uv;",
      "  float aspect=u_resolution.x/max(u_resolution.y,1.0);",
      "  vec2 p=vec2((uv.x-0.5)*aspect,uv.y-0.5);",
      "  float t=u_time; float y=uv.y;",
      "  float vel=clamp(u_velocity*12.0,-1.0,1.0);",
      "  float impulse=clamp(u_impulse,0.0,1.0);",
      "  float pushBias=vel*0.010;",
      "  float leadBulge=exp(-pow((y-0.50-vel*0.08)/0.19,2.0))*vel*0.030;",
      "  float dragTail=exp(-pow((y-0.50+vel*0.12)/0.30,2.0))*(-vel)*0.018;",
      "  float n=fbm(vec2(y*4.2+u_seed,t*0.16));",
      "  float wave=sin(y*8.2+t*0.72+u_seed)*0.010",
      "    +sin(y*16.4-t*0.56+u_seed*1.9)*0.006",
      "    +sin(y*33.0+t*1.06+vel*2.0)*0.0028;",
      "  float bulgeTop=exp(-pow((y-0.69)/0.088,2.0))*sin(t*0.72+1.15)*0.015;",
      "  float bulgeBottom=exp(-pow((y-0.33)/0.078,2.0))*sin(t*0.64+4.3)*0.013;",
      "  float stirZone=exp(-pow((y-u_pointerY)/0.23,2.0));",
      "  float stirWave=stirZone*u_stir*(sin(y*25.0-t*3.1+u_seed)*0.013+sin(y*41.0+t*2.2)*0.005);",
      "  float edge=u_progress+pushBias+leadBulge+dragTail+wave+(n-0.5)*0.036+bulgeTop-bulgeBottom+stirWave;",
      "  float d=uv.x-edge;",
      "  float fillMask=1.0-smoothstep(-0.004,0.005,d);",
      "  float behind=max(edge-uv.x,0.0);",
      "  vec2 flowP=p*vec2(1.42,1.86);",
      "  flowP+=vec2(sin(y*18.0-t*2.4),cos(y*13.0+t*1.8))*stirZone*u_stir*0.18;",
      "  vec2 warp=vec2(",
      "    fbm(flowP*0.72+vec2(t*0.055,-t*0.036)+vec2(u_seed)),",
      "    fbm(flowP*0.83+vec2(-t*0.042,t*0.047)+vec2(6.2+u_seed))",
      "  );",
      "  vec2 warped=flowP+(warp-0.5)*(1.10+impulse*0.22);",
      "  float smokeA=fbm(warped*1.16+vec2(-t*0.070,t*0.022));",
      "  float smokeB=fbm(warped*2.16+vec2(t*0.088,-t*0.054));",
      "  float smoke=smoothstep(0.24,0.84,smokeA*0.74+smokeB*0.36);",
      "  float nearTrail=exp(-behind*(11.8-impulse*2.2));",
      "  float wideTrail=exp(-behind*(4.5-impulse*0.9));",
      "  float verticalFade=smoothstep(0.0,0.12,uv.y)*smoothstep(0.0,0.12,1.0-uv.y);",
      "  float trail=fillMask*verticalFade*(smoke*nearTrail+smokeA*wideTrail*0.44);",
      "  float echoActivity=sat((abs(u_progress-u_echo1)+abs(u_echo1-u_echo2))*18.0);",
      "  float echoD1=uv.x-(u_echo1+wave*0.72+(n-0.5)*0.018);",
      "  float echoD2=uv.x-(u_echo2+wave*0.48+(n-0.5)*0.010);",
      "  float echoGlow1=exp(-abs(echoD1)*92.0)*u_echo*echoActivity*verticalFade;",
      "  float echoGlow2=exp(-abs(echoD2)*58.0)*u_echo*echoActivity*verticalFade;",
      "  vec3 color=mix(u_darkRight,u_darkLeft,fillMask*0.76);",
      "  color+=u_color2*echoGlow2*0.22+u_color3*echoGlow1*0.38;",
      "  float chroma=sat(smoke*1.16+nearTrail*0.35);",
      "  vec3 fluid=mix(u_color0,u_color1,smoothstep(0.16,0.62,chroma));",
      "  fluid=mix(fluid,u_color2,smoothstep(0.42,0.90,nearTrail*(0.62+smoke*0.74)));",
      "  color=mix(color,fluid,sat(trail*0.96));",
      "  float aura=exp(-behind*17.6)*fillMask;",
      "  color+=u_color1*aura*(0.14+smoke*0.20);",
      "  color+=u_color2*aura*smoke*smoke*(0.16+impulse*0.08);",
      "  float core=exp(-abs(d)*395.0);",
      "  float inner=exp(-abs(d)*114.0);",
      "  float outer=exp(-abs(d)*28.0);",
      "  color+=u_color2*outer*0.18;",
      "  color+=u_color3*inner*(0.78+impulse*0.15);",
      "  color+=u_color4*core*(1.08+impulse*0.12);",
      "  float rightMask=smoothstep(0.002,0.040,d);",
      "  color=mix(color,u_darkRight+u_color3*outer*0.03,rightMask*0.92);",
      "  float vignette=1.0-smoothstep(0.20,0.88,length((uv-0.5)*vec2(0.60,1.0)));",
      "  color*=0.90+vignette*0.10;",
      "  color=color/(1.0+color*0.14);",
      "  color=pow(max(color,vec3(0.0)),vec3(0.94));",
      "  gl_FragColor=vec4(color,1.0);",
      "}"
    ].join("\n");

    function compile(type, source) {
      var shader = gl.createShader(type);
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        var log = gl.getShaderInfoLog(shader) || "Shader compile error";
        gl.deleteShader(shader);
        throw new Error(log);
      }
      return shader;
    }

    var program = gl.createProgram();
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vertexSource));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragmentSource));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || "Program link error");
    }
    gl.useProgram(program);

    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      -1,-1, 1,-1, -1,1,
      -1,1, 1,-1, 1,1
    ]), gl.STATIC_DRAW);

    var position = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(position);
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0);

    var uniform = {};
    ["resolution","time","progress","seed","velocity","impulse","stir","echo","echo1","echo2","pointerY","darkRight","darkLeft","color0","color1","color2","color3","color4"].forEach(function (name) {
      uniform[name] = gl.getUniformLocation(program, "u_" + name);
    });

    var self = this;
    return function (now) {
      var size = self._resizeCanvas(canvas, gl);
      var theme = self._theme();
      gl.useProgram(program);
      gl.uniform2f(uniform.resolution, size.width, size.height);
      gl.uniform1f(uniform.time, (now - self.startTime) / 1000);
      gl.uniform1f(uniform.progress, self.state.current);
      gl.uniform1f(uniform.seed, theme.seed);
      gl.uniform1f(uniform.velocity, self.state.velocity);
      gl.uniform1f(uniform.impulse, self.state.impulse);
      gl.uniform1f(uniform.stir, self.reducedMotion ? 0 : self.state.stirEnergy);
      gl.uniform1f(uniform.echo, self.reducedMotion ? 0 : self.effects.echo);
      gl.uniform1f(uniform.echo1, self.state.echo1);
      gl.uniform1f(uniform.echo2, self.state.echo2);
      gl.uniform1f(uniform.pointerY, self.state.pointerY);
      gl.uniform3fv(uniform.darkRight, theme.darkRight);
      gl.uniform3fv(uniform.darkLeft, theme.darkLeft);
      gl.uniform3fv(uniform.color0, theme.color0);
      gl.uniform3fv(uniform.color1, theme.color1);
      gl.uniform3fv(uniform.color2, theme.color2);
      gl.uniform3fv(uniform.color3, theme.color3);
      gl.uniform3fv(uniform.color4, theme.color4);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
    };
  };

  FluidProgressCard.prototype._createCanvasRenderer = function () {
    var canvas = this.fallbackCanvas;
    var ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas 2D unavailable.");
    var self = this;

    function rgb(color, alpha) {
      return "rgba(" + Math.round(color[0]*255) + "," + Math.round(color[1]*255) + "," + Math.round(color[2]*255) + "," + alpha + ")";
    }

    function edgeX(y, width, height, time, progress, phase) {
      var yn = y / Math.max(height, 1);
      var vel = clamp(self.state.velocity * 12, -1, 1);
      var stirZone = Math.exp(-Math.pow((yn - self.state.pointerY) / .23, 2));
      return width * progress
        + vel * width * .012
        + Math.sin(yn * 8 + time * 1.1 + phase) * width * .009
        + Math.sin(yn * 17 - time * .82 + phase * .7) * width * .005
        + Math.sin(yn * 31 + time * 1.38) * width * .0025
        + Math.exp(-Math.pow((yn - .52 - vel * .08) / .22, 2)) * vel * width * .026
        + stirZone * self.state.stirEnergy * Math.sin(yn * 25 - time * 3.1) * width * .013;
    }

    return function (now) {
      var size = self._resizeCanvas(canvas, null);
      var width = size.cssWidth;
      var height = size.cssHeight;
      var dpr = size.dpr;
      var time = (now - self.startTime) / 1000;
      var theme = self._theme();

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = rgb(theme.darkRight, 1);
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      for (var y = 0; y <= height; y += 3) ctx.lineTo(edgeX(y, width, height, time, self.state.current, 0), y);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.clip();

      var gradient = ctx.createLinearGradient(0, 0, width * self.state.current, 0);
      gradient.addColorStop(0, rgb(theme.color0, 1));
      gradient.addColorStop(.48, rgb(theme.color1, 1));
      gradient.addColorStop(.76, rgb(theme.color2, 1));
      gradient.addColorStop(1, rgb(theme.color3, 1));
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.lineCap = "round";
      var echoActivity = clamp(
        (Math.abs(self.state.current - self.state.echo1) + Math.abs(self.state.echo1 - self.state.echo2)) * 18,
        0,
        1
      ) * self.effects.echo;
      if (echoActivity > .001) {
        var echoProgress = [self.state.echo2, self.state.echo1];
        for (var echoIndex = 0; echoIndex < echoProgress.length; echoIndex++) {
          ctx.beginPath();
          for (var echoY = 0; echoY <= height; echoY += 3) {
            var echoX = edgeX(echoY, width, height, time, echoProgress[echoIndex], (echoIndex + 1) * .7);
            if (echoY === 0) ctx.moveTo(echoX, echoY); else ctx.lineTo(echoX, echoY);
          }
          ctx.strokeStyle = rgb(echoIndex === 0 ? theme.color2 : theme.color3, echoActivity * (echoIndex === 0 ? .18 : .32));
          ctx.lineWidth = echoIndex === 0 ? 9 : 5;
          ctx.shadowBlur = echoIndex === 0 ? 18 : 12;
          ctx.shadowColor = rgb(theme.color2, echoActivity * .55);
          ctx.stroke();
        }
      }
      for (var layer = 0; layer < 3; layer++) {
        ctx.beginPath();
        for (var yy = 0; yy <= height; yy += 2) {
          var x = edgeX(yy, width, height, time, self.state.current, 0);
          if (yy === 0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
        }
        if (layer === 0) {
          ctx.strokeStyle = rgb(theme.color2, .25);
          ctx.lineWidth = 20;
          ctx.shadowBlur = 28;
          ctx.shadowColor = rgb(theme.color1, .65);
        } else if (layer === 1) {
          ctx.strokeStyle = rgb(theme.color3, .86);
          ctx.lineWidth = 6;
          ctx.shadowBlur = 14;
          ctx.shadowColor = rgb(theme.color2, .86);
        } else {
          ctx.strokeStyle = rgb(theme.color4, .98);
          ctx.lineWidth = 2;
          ctx.shadowBlur = 8;
          ctx.shadowColor = rgb(theme.color4, .95);
        }
        ctx.stroke();
      }
      ctx.restore();
    };
  };

  FluidProgressCard.prototype.setProgress = function (value, immediate) {
    var parsed = finiteNumber(value, NaN);
    if (!Number.isFinite(parsed)) return this;
    var normalized = clamp(parsed / 100, 0, 1);
    this.state.target = normalized;
    this.state.settled = Boolean(immediate);
    this.root.setAttribute("data-progress", String(Math.round(normalized * 10000) / 100));
    this._updateA11y();
    if (immediate) {
      this.state.current = normalized;
      this.state.velocity = 0;
      this.state.impulse = 0;
      this.state.echo1 = normalized;
      this.state.echo2 = normalized;
      this.state.stirEnergy = 0;
      this.state.sparkEnergy = 0;
      this._updatePercent(true);
      this._updateSparks(true);
    }
    this._requestRender();
    return this;
  };

  FluidProgressCard.prototype.getProgress = function () {
    return this.state.current * 100;
  };

  FluidProgressCard.prototype.getTargetProgress = function () {
    return this.state.target * 100;
  };

  FluidProgressCard.prototype.setEffects = function (effects) {
    effects = effects || {};
    if (effects.stir !== undefined) this.effects.stir = unitValue(effects.stir, this.effects.stir);
    if (effects.delay !== undefined) this.effects.delay = unitValue(effects.delay, this.effects.delay);
    if (effects.echo !== undefined) this.effects.echo = unitValue(effects.echo, this.effects.echo);
    if (effects.spark !== undefined) this.effects.spark = unitValue(effects.spark, this.effects.spark);
    if (this.effects.spark > 0) this._ensureSparks();
    if (this.effects.stir === 0) this.state.stirEnergy = 0;
    if (this.effects.spark === 0) this.state.sparkEnergy = 0;
    if (this.effects.delay === 0 && this.effects.echo === 0) {
      this.state.echo1 = this.state.current;
      this.state.echo2 = this.state.current;
    }
    this.root.setAttribute("data-stir", String(this.effects.stir));
    this.root.setAttribute("data-delay", String(this.effects.delay));
    this.root.setAttribute("data-echo", String(this.effects.echo));
    this.root.setAttribute("data-spark", String(this.effects.spark));
    this._updateSparks(true);
    this._requestRender();
    return this;
  };

  FluidProgressCard.prototype.getEffects = function () {
    return {
      stir: this.effects.stir,
      delay: this.effects.delay,
      echo: this.effects.echo,
      spark: this.effects.spark
    };
  };

  FluidProgressCard.prototype.setTheme = function (name) {
    if (THEMES[name]) {
      this.themeName = name;
      this.root.setAttribute("data-theme", name);
      this._syncSparkColor();
      this._requestRender();
    }
    return this;
  };

  FluidProgressCard.prototype.setText = function (title, subtitle) {
    if (title !== undefined) {
      this.title = String(title);
      this.titleElement.textContent = this.title;
      if (!this.hasCustomAriaLabel) {
        this.ariaLabel = this.title || "Progress";
        this.root.setAttribute("aria-label", this.ariaLabel);
      }
    }
    if (subtitle !== undefined) {
      this.subtitle = String(subtitle);
      this.subtitleElement.textContent = this.subtitle;
    }
    return this;
  };

  FluidProgressCard.prototype.setDraggable = function (enabled) {
    this.draggable = Boolean(enabled);
    if (!this.draggable && this.state.pointerId !== null) {
      try { this.root.releasePointerCapture(this.state.pointerId); } catch (error) {}
      this.state.dragging = false;
      this.state.pointerId = null;
    }
    this.root.setAttribute("data-draggable", String(this.draggable));
    this.lastAriaValue = null;
    this._syncInteractionSemantics();
    return this;
  };

  FluidProgressCard.prototype.destroy = function () {
    this.destroyed = true;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = 0;
    this.root.removeEventListener("pointerdown", this.onPointerDown);
    this.root.removeEventListener("pointermove", this.onPointerMove);
    this.root.removeEventListener("pointerup", this.onPointerEnd);
    this.root.removeEventListener("pointercancel", this.onPointerEnd);
    this.root.removeEventListener("keydown", this.onKeyDown);
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
    this.webglCanvas.removeEventListener("webglcontextlost", this.onWebGLContextLost, false);
    this.webglCanvas.removeEventListener("webglcontextrestored", this.onWebGLContextRestored, false);
    if (this.intersectionObserver) this.intersectionObserver.disconnect();
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.motionQuery) {
      if (this.motionQuery.removeEventListener) this.motionQuery.removeEventListener("change", this.onMotionChange);
      else if (this.motionQuery.removeListener) this.motionQuery.removeListener(this.onMotionChange);
    }
    this.root.setAttribute("aria-disabled", "true");
    this.root.removeAttribute("tabindex");
    if (this.sparksElement) {
      this.sparksElement.style.opacity = "0";
      this.sparksElement.classList.remove("fpc-sparks-active");
    }
    this.renderer = null;
    instances.delete(this.root);
  };

  function create(elementOrSelector, options) {
    var element = typeof elementOrSelector === "string" ? document.querySelector(elementOrSelector) : elementOrSelector;
    return new FluidProgressCard(element, options || {});
  }

  function initAll(scope) {
    var parent = scope || document;
    var list = parent.querySelectorAll("[data-fluid-progress]");
    var result = [];
    for (var i = 0; i < list.length; i++) result.push(create(list[i]));
    return result;
  }

  function get(elementOrSelector) {
    var element = typeof elementOrSelector === "string" ? document.querySelector(elementOrSelector) : elementOrSelector;
    return instances.get(element) || null;
  }

  global.FluidProgress = {
    create: create,
    initAll: initAll,
    get: get,
    themes: THEMES,
    version: "1.3.1"
  };

  function autoInit() { initAll(document); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", autoInit);
  else autoInit();
})(window);
