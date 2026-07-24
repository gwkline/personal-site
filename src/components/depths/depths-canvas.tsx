import { useAtomSet } from "@effect/atom-react";
import { useEffect, useRef } from "react";

import { gameErrorAtom, gameStateAtom } from "@/components/depths/depths-atoms";
import { createDepthsSession } from "@/components/depths/depths-runtime";
import type { DepthsSession } from "@/components/depths/depths-runtime";

interface DepthsCanvasProps {
  readonly onSession: (session: DepthsSession | null) => void;
}

export const DepthsCanvas = ({ onSession }: DepthsCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const setError = useAtomSet(gameErrorAtom);
  const setState = useAtomSet(gameStateAtom);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }
    const session = createDepthsSession(canvas, setState, setError);
    onSession(session);
    return () => {
      onSession(null);
      session.dispose();
    };
  }, [onSession, setError, setState]);

  return (
    <canvas
      aria-label="Depths procedurally generated dungeon"
      className="block size-full touch-none bg-[#100f1c] [image-rendering:pixelated]"
      data-testid="depths-canvas"
      ref={canvasRef}
      tabIndex={0}
    >
      Depths is a keyboard and touch-controlled dungeon crawler.
    </canvas>
  );
};
