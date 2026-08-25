import { useEffect, useRef } from "react";

const ARTWORK_SRC = "/gavin-dithered-landscape.webp";
const MAX_DEVICE_PIXEL_RATIO = 1.5;
const POINTER_RADIUS = 150;
const SHOCKWAVE_LIFETIME = 1.65;

const PARTICLE_COLORS = [
  "#07183c",
  "#0b3f98",
  "#3279c6",
  "#f09a58",
  "#f6c08f",
] as const;

interface Particle {
  baseX: number;
  baseY: number;
  colorIndex: number;
  depth: number;
  phase: number;
  radius: number;
  shape: "dash" | "dot";
  vx: number;
  vy: number;
  x: number;
  y: number;
}

interface PointerState {
  active: boolean;
  parallaxX: number;
  parallaxY: number;
  targetParallaxX: number;
  targetParallaxY: number;
  x: number;
  y: number;
}

interface Shockwave {
  startedAt: number;
  x: number;
  y: number;
}

interface ArtworkGeometry {
  drawHeight: number;
  drawWidth: number;
  drawX: number;
  drawY: number;
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const deterministicNoise = (x: number, y: number) => {
  const value = Math.sin(x * 12.9898 + y * 78.233) * 43_758.5453;
  return value - Math.floor(value);
};

const getArtworkGeometry = (
  width: number,
  height: number,
  image: HTMLImageElement
): ArtworkGeometry => {
  const overscan = 1.055;
  const scale =
    Math.max(width / image.naturalWidth, height / image.naturalHeight) *
    overscan;
  const drawWidth = image.naturalWidth * scale;
  const drawHeight = image.naturalHeight * scale;
  const focalX = width < 640 ? 0.68 : 0.58;

  return {
    drawHeight,
    drawWidth,
    drawX: (width - drawWidth) * focalX,
    drawY: (height - drawHeight) * 0.48,
  };
};

const getParticleColorIndex = (
  red: number,
  green: number,
  blue: number,
  luminance: number
) => {
  const warm = red > blue * 1.05 && red > green * 0.98;

  if (warm && luminance > 0.62) {
    return 4;
  }
  if (warm) {
    return 3;
  }
  if (luminance > 0.57) {
    return 2;
  }
  if (luminance > 0.25) {
    return 1;
  }
  return 0;
};

const buildParticles = (
  image: HTMLImageElement,
  width: number,
  height: number
) => {
  const sampleCanvas = document.createElement("canvas");
  sampleCanvas.width = Math.max(1, Math.floor(width));
  sampleCanvas.height = Math.max(1, Math.floor(height));

  const sampleContext = sampleCanvas.getContext("2d", {
    willReadFrequently: true,
  });
  if (!sampleContext) {
    return [];
  }

  const geometry = getArtworkGeometry(width, height, image);
  sampleContext.drawImage(
    image,
    geometry.drawX,
    geometry.drawY,
    geometry.drawWidth,
    geometry.drawHeight
  );

  const pixels = sampleContext.getImageData(0, 0, width, height).data;
  const spacing = width < 640 ? 6 : 5;
  const particles: Particle[] = [];

  for (let y = spacing / 2; y < height; y += spacing) {
    for (let x = spacing / 2; x < width; x += spacing) {
      const pixelX = Math.floor(x);
      const pixelY = Math.floor(y);
      const pixelIndex = (pixelY * Math.floor(width) + pixelX) * 4;
      const red = pixels[pixelIndex] ?? 0;
      const green = pixels[pixelIndex + 1] ?? 0;
      const blue = pixels[pixelIndex + 2] ?? 0;
      const luminance = (red * 0.2126 + green * 0.7152 + blue * 0.0722) / 255;
      const noise = deterministicNoise(pixelX, pixelY);
      const keepThreshold = 0.18 + noise * 0.44;

      if (luminance < keepThreshold && noise < 0.91) {
        continue;
      }

      const colorIndex = getParticleColorIndex(red, green, blue, luminance);
      const depth = clamp(0.18 + luminance * 0.96, 0.18, 1);
      const radius = 0.55 + luminance * 1.45 + noise * 0.35;

      particles.push({
        baseX: x,
        baseY: y,
        colorIndex,
        depth,
        phase: noise * Math.PI * 2,
        radius,
        shape: noise > 0.82 ? "dash" : "dot",
        vx: 0,
        vy: 0,
        x,
        y,
      });
    }
  }

  return particles.toSorted(
    (left, right) => left.colorIndex - right.colorIndex
  );
};

export const DitheredLandscape = () => {
  const artworkRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const artwork = artworkRef.current;
    const canvas = canvasRef.current;
    const surface = canvas?.closest<HTMLElement>("[data-landscape-surface]");
    if (!(artwork && canvas && surface)) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    const image = new Image();
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const pointer: PointerState = {
      active: false,
      parallaxX: 0,
      parallaxY: 0,
      targetParallaxX: 0,
      targetParallaxY: 0,
      x: 0,
      y: 0,
    };
    const shockwaves: Shockwave[] = [];

    let animationFrame = 0;
    let height = 1;
    let imageReady = false;
    let particles: Particle[] = [];
    let reducedMotion = motionQuery.matches;
    let width = 1;

    const updateArtworkPosition = (parallaxX: number, parallaxY: number) => {
      artwork.style.transform = `translate3d(${parallaxX * -10}px, ${
        parallaxY * -6
      }px, 0) scale(1.055)`;
    };

    const updateParticles = (timestamp: number) => {
      const seconds = timestamp / 1000;
      const activeShockwaves = shockwaves.filter(
        (shockwave) =>
          (timestamp - shockwave.startedAt) / 1000 < SHOCKWAVE_LIFETIME
      );
      shockwaves.splice(0, shockwaves.length, ...activeShockwaves);

      for (const particle of particles) {
        const wind =
          Math.sin(seconds * 0.72 + particle.phase) * 0.48 * particle.depth;
        const targetX =
          particle.baseX + pointer.parallaxX * particle.depth * 15 + wind;
        const targetY = particle.baseY + pointer.parallaxY * particle.depth * 9;

        particle.vx += (targetX - particle.x) * 0.038;
        particle.vy += (targetY - particle.y) * 0.038;

        if (pointer.active) {
          const deltaX = particle.x - pointer.x;
          const deltaY = particle.y - pointer.y;
          const distance = Math.hypot(deltaX, deltaY);

          if (distance > 0 && distance < POINTER_RADIUS) {
            const force = (1 - distance / POINTER_RADIUS) ** 2;
            particle.vx += (deltaX / distance) * force * 1.35 * particle.depth;
            particle.vy += (deltaY / distance) * force * 1.35 * particle.depth;
          }
        }

        for (const shockwave of activeShockwaves) {
          const age = (timestamp - shockwave.startedAt) / 1000;
          const waveRadius = age * 560;
          const deltaX = particle.x - shockwave.x;
          const deltaY = particle.y - shockwave.y;
          const distance = Math.hypot(deltaX, deltaY);
          const distanceFromWave = Math.abs(distance - waveRadius);

          if (distance > 0 && distanceFromWave < 34) {
            const force = (1 - distanceFromWave / 34) * (1 - age / 1.65);
            particle.vx += (deltaX / distance) * force * 5.2 * particle.depth;
            particle.vy += (deltaY / distance) * force * 5.2 * particle.depth;
          }
        }

        particle.vx *= 0.87;
        particle.vy *= 0.87;
        particle.x += particle.vx;
        particle.y += particle.vy;
      }
    };

    const drawParticles = () => {
      context.globalCompositeOperation = "screen";
      let activeColorIndex = -1;

      for (const particle of particles) {
        if (particle.colorIndex !== activeColorIndex) {
          if (activeColorIndex >= 0) {
            context.fill();
          }
          activeColorIndex = particle.colorIndex;
          context.fillStyle = PARTICLE_COLORS[activeColorIndex] ?? "#ffffff";
          context.beginPath();
        }

        let { radius } = particle;
        if (pointer.active && !reducedMotion) {
          const distance = Math.hypot(
            particle.x - pointer.x,
            particle.y - pointer.y
          );
          if (distance < POINTER_RADIUS) {
            radius *= 1 + (1 - distance / POINTER_RADIUS) * 0.7;
          }
        }

        if (particle.shape === "dash") {
          context.fillRect(
            particle.x - radius * 1.25,
            particle.y - radius * 0.38,
            radius * 2.5,
            Math.max(0.8, radius * 0.76)
          );
        } else {
          context.moveTo(particle.x + radius, particle.y);
          context.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
        }
      }

      if (activeColorIndex >= 0) {
        context.fill();
      }
      context.globalCompositeOperation = "source-over";
    };

    const draw = (timestamp: number) => {
      if (!imageReady) {
        return;
      }

      pointer.parallaxX +=
        (pointer.targetParallaxX - pointer.parallaxX) * 0.055;
      pointer.parallaxY +=
        (pointer.targetParallaxY - pointer.parallaxY) * 0.055;

      if (!reducedMotion) {
        updateParticles(timestamp);
      }

      context.clearRect(0, 0, width, height);
      updateArtworkPosition(pointer.parallaxX, pointer.parallaxY);
      drawParticles();
      canvas.style.opacity = "1";
    };

    const render = (timestamp: number) => {
      draw(timestamp);
      animationFrame = window.requestAnimationFrame(render);
    };

    const start = () => {
      window.cancelAnimationFrame(animationFrame);
      if (reducedMotion) {
        draw(0);
        return;
      }
      animationFrame = window.requestAnimationFrame(render);
    };

    const resize = () => {
      const bounds = canvas.getBoundingClientRect();
      width = Math.max(1, Math.round(bounds.width));
      height = Math.max(1, Math.round(bounds.height));
      const devicePixelRatio = Math.min(
        window.devicePixelRatio || 1,
        MAX_DEVICE_PIXEL_RATIO
      );

      canvas.width = Math.round(width * devicePixelRatio);
      canvas.height = Math.round(height * devicePixelRatio);
      context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);

      if (imageReady) {
        particles = buildParticles(image, width, height);
        start();
      }
    };

    const updatePointer = (event: PointerEvent) => {
      if (reducedMotion) {
        return;
      }
      const bounds = canvas.getBoundingClientRect();
      const relativeX = clamp(event.clientX - bounds.left, 0, bounds.width);
      const relativeY = clamp(event.clientY - bounds.top, 0, bounds.height);

      pointer.active = true;
      pointer.x = relativeX;
      pointer.y = relativeY;
      pointer.targetParallaxX = (relativeX / bounds.width - 0.5) * 2;
      pointer.targetParallaxY = (relativeY / bounds.height - 0.5) * 2;
    };

    const handlePointerDown = (event: PointerEvent) => {
      if (reducedMotion) {
        return;
      }
      const { target } = event;
      if (target instanceof HTMLElement && target.closest("a, button")) {
        return;
      }

      updatePointer(event);
      shockwaves.push({
        startedAt: performance.now(),
        x: pointer.x,
        y: pointer.y,
      });
    };

    const handlePointerLeave = () => {
      pointer.active = false;
      pointer.targetParallaxX = 0;
      pointer.targetParallaxY = 0;
    };

    const handleReducedMotion = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      pointer.active = false;
      pointer.parallaxX = 0;
      pointer.parallaxY = 0;
      pointer.targetParallaxX = 0;
      pointer.targetParallaxY = 0;
      shockwaves.length = 0;
      particles = buildParticles(image, width, height);
      start();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    surface.addEventListener("pointermove", updatePointer);
    surface.addEventListener("pointerdown", handlePointerDown);
    surface.addEventListener("pointerleave", handlePointerLeave);
    motionQuery.addEventListener("change", handleReducedMotion);

    image.addEventListener("load", () => {
      imageReady = true;
      resize();
    });
    image.src = ARTWORK_SRC;

    return () => {
      window.cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      surface.removeEventListener("pointermove", updatePointer);
      surface.removeEventListener("pointerdown", handlePointerDown);
      surface.removeEventListener("pointerleave", handlePointerLeave);
      motionQuery.removeEventListener("change", handleReducedMotion);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden bg-hero-night"
      data-testid="dithered-landscape"
    >
      <img
        alt=""
        className="absolute inset-0 size-full object-cover object-[68%_center] brightness-[0.8] contrast-[1.04] saturate-[1.04] will-change-transform lg:object-[58%_center]"
        ref={artworkRef}
        src={ARTWORK_SRC}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,transparent_0%,transparent_56%,rgba(240,154,88,0.13)_100%)] mix-blend-screen" />
      <canvas
        className="absolute inset-0 size-full touch-none opacity-0 transition-opacity duration-700"
        ref={canvasRef}
      />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_74%_25%,transparent_0%,transparent_28%,rgba(1,8,24,0.12)_66%,rgba(1,7,20,0.34)_100%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[repeating-linear-gradient(0deg,transparent_0,transparent_3px,rgba(240,213,154,0.035)_4px)] mix-blend-screen" />
    </div>
  );
};
