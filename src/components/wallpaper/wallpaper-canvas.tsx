import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import * as THREE from "three";

import {
  createAsciiAtlas,
  createWallpaperMaterial,
  updateWallpaperMaterial,
} from "@/components/wallpaper/wallpaper-shader";
import type { WallpaperConfig } from "@/components/wallpaper/wallpaper-types";
import { cn } from "@/lib/utils";

export interface WallpaperCanvasHandle {
  download: () => void;
}

interface WallpaperCanvasProps {
  className?: string;
  config: WallpaperConfig;
}

const downloadCanvas = (canvas: HTMLCanvasElement) => {
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = canvas.width;
  exportCanvas.height = canvas.height;
  const context = exportCanvas.getContext("2d");
  if (!context) {
    return;
  }
  context.drawImage(canvas, 0, 0);
  exportCanvas.toBlob(
    (blob) => {
      if (!blob) {
        return;
      }
      const link = document.createElement("a");
      link.download = `motion-canvas-${Date.now()}.png`;
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
    },
    "image/png",
    0.95
  );
};

export const WallpaperCanvas = forwardRef<
  WallpaperCanvasHandle,
  WallpaperCanvasProps
>(({ className, config }, forwardedRef) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const configRef = useRef(config);
  const drawRef = useRef<(() => void) | null>(null);
  const resizeRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    const qualityChanged = configRef.current.ecoMode !== config.ecoMode;
    configRef.current = config;
    if (qualityChanged) {
      resizeRef.current?.();
    }
    drawRef.current?.();
  }, [config]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const renderer = new THREE.WebGLRenderer({
      alpha: false,
      antialias: false,
      canvas,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    const atlas = createAsciiAtlas();
    const material = createWallpaperMaterial(atlas);
    const geometry = new THREE.PlaneGeometry(2, 2);
    scene.add(new THREE.Mesh(geometry, material));

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    let animationFrame = 0;
    let cssHeight = 1;
    let cssWidth = 1;
    let currentTime = 0;
    let lastRenderedAt = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      cssWidth = Math.max(1, rect.width);
      cssHeight = Math.max(1, rect.height);
      let pixelRatio = configRef.current.ecoMode ? 1 : 1.75;
      if (coarsePointer.matches) {
        pixelRatio = configRef.current.ecoMode ? 0.85 : 1.2;
      }
      renderer.setPixelRatio(
        Math.min(window.devicePixelRatio || 1, pixelRatio)
      );
      renderer.setSize(cssWidth, cssHeight, false);
    };

    const draw = () => {
      updateWallpaperMaterial(
        material,
        configRef.current,
        cssWidth,
        cssHeight,
        currentTime
      );
      renderer.render(scene, camera);
    };

    resizeRef.current = resize;
    drawRef.current = draw;
    const animate = (timestamp: number) => {
      const activeConfig = configRef.current;
      const frameInterval = 1000 / (activeConfig.ecoMode ? 30 : 60);
      const shouldAnimate =
        !activeConfig.isPaused && !document.hidden && !reducedMotion.matches;
      if (
        shouldAnimate &&
        (lastRenderedAt === 0 || timestamp - lastRenderedAt >= frameInterval)
      ) {
        currentTime = timestamp / 1000;
        draw();
        lastRenderedAt = timestamp;
      }
      animationFrame = window.requestAnimationFrame(animate);
    };

    resize();
    draw();
    const observer = new ResizeObserver(() => {
      resize();
      draw();
    });
    observer.observe(canvas);
    animationFrame = window.requestAnimationFrame(animate);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(animationFrame);
      drawRef.current = null;
      resizeRef.current = null;
      geometry.dispose();
      material.dispose();
      atlas.dispose();
      renderer.dispose();
    };
  }, []);

  useImperativeHandle(
    forwardedRef,
    () => ({
      download: () => {
        const canvas = canvasRef.current;
        if (!canvas) {
          return;
        }
        drawRef.current?.();
        downloadCanvas(canvas);
      },
    }),
    []
  );

  return (
    <div
      className={cn(
        "relative size-full min-h-[30rem] overflow-hidden bg-black fullscreen:min-h-screen fullscreen:rounded-none",
        className
      )}
    >
      <canvas
        aria-label={`Animated ${config.mode} wallpaper preview`}
        className="block size-full"
        ref={canvasRef}
      >
        Animated {config.mode} wallpaper preview
      </canvas>
    </div>
  );
});

WallpaperCanvas.displayName = "WallpaperCanvas";
