import { useEffect, useRef } from "react";

export type RainObstacle = {
  ref: React.RefObject<HTMLElement | null>;
  shape: "box" | "canvas" | "image" | "text";
};

type RainOverlayProps = {
  active: boolean;
  obstacles: RainObstacle[];
};

type Drop = {
  x: number;
  y: number;
  speed: number;
  acceleration: number;
  maxSpeed: number;
  length: number;
  drift: number;
};

type Splash = {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  life: number;
  maxLife: number;
  size: number;
};

type AlphaMask = {
  data: ImageData;
  rect: DOMRect;
  frame: number;
};

const DROP_COUNT = 480;
const MAX_SPLASHES = 500;

export function RainOverlay({ active, obstacles }: RainOverlayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !active) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const drops: Drop[] = Array.from({ length: DROP_COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      speed: 6 + Math.random() * 7,
      acceleration: 0.09 + Math.random() * 0.08,
      maxSpeed: 22 + Math.random() * 10,
      length: 18 + Math.random() * 22,
      drift: -1.2 + Math.random() * 2.4,
    }));
    const splashes: Splash[] = [];
    const maskCanvas = document.createElement("canvas");
    const maskContext = maskCanvas.getContext("2d", { willReadFrequently: true });
    const masks = new WeakMap<HTMLElement, AlphaMask>();
    let frameId = 0;
    let frame = 0;

    const resize = () => {
      const pixelRatio = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * pixelRatio;
      canvas.height = window.innerHeight * pixelRatio;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    };

    const resetDrop = (drop: Drop, y = -48) => {
      drop.x = Math.random() * window.innerWidth;
      drop.y = y;
      drop.speed = 6 + Math.random() * 7;
      drop.acceleration = 0.09 + Math.random() * 0.08;
      drop.maxSpeed = 22 + Math.random() * 10;
      drop.length = 18 + Math.random() * 22;
      drop.drift = -1.2 + Math.random() * 2.4;
    };

    const createMask = (obstacle: RainObstacle, rect: DOMRect) => {
      if (!maskContext || rect.width <= 0 || rect.height <= 0) return undefined;

      const pixelRatio = window.devicePixelRatio || 1;
      maskCanvas.width = Math.ceil(rect.width * pixelRatio);
      maskCanvas.height = Math.ceil(rect.height * pixelRatio);
      maskContext.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      maskContext.clearRect(0, 0, rect.width, rect.height);

      if (obstacle.shape === "image") {
        maskContext.drawImage(obstacle.ref.current as HTMLImageElement, 0, 0, rect.width, rect.height);
      }

      if (obstacle.shape === "canvas") {
        const source = obstacle.ref.current?.querySelector("canvas");
        if (!source) return undefined;
        maskContext.drawImage(source, 0, 0, rect.width, rect.height);
      }

      if (obstacle.shape === "text") {
        const style = window.getComputedStyle(obstacle.ref.current!);
        maskContext.font = style.font;
        maskContext.fillStyle = "#fff";
        maskContext.textBaseline = "top";
        maskContext.fillText(obstacle.ref.current?.textContent ?? "", 0, 0);
      }

      return { data: maskContext.getImageData(0, 0, maskCanvas.width, maskCanvas.height), rect, frame };
    };

    const isMaskedPixel = (mask: AlphaMask, x: number, y: number) => {
      if (x < mask.rect.left || x > mask.rect.right || y < mask.rect.top || y > mask.rect.bottom) {
        return false;
      }

      const pixelX = Math.floor(((x - mask.rect.left) / mask.rect.width) * mask.data.width);
      const pixelY = Math.floor(((y - mask.rect.top) / mask.rect.height) * mask.data.height);
      const alphaIndex = (pixelY * mask.data.width + pixelX) * 4 + 3;

      return mask.data.data[alphaIndex] > 36;
    };

    const findImpact = (drop: Drop, nextY: number) => {
      for (const obstacle of obstacles) {
        const element = obstacle.ref.current;
        if (!element) continue;

        const rect = element.getBoundingClientRect();
        if (drop.x < rect.left || drop.x > rect.right) continue;

        if (obstacle.shape === "box") {
          if (drop.y + drop.length <= rect.top && nextY + drop.length >= rect.top) return rect.top;
          continue;
        }

        const currentMask = masks.get(element);
        const hasMoved =
          currentMask &&
          (currentMask.rect.left !== rect.left ||
            currentMask.rect.top !== rect.top ||
            currentMask.rect.width !== rect.width ||
            currentMask.rect.height !== rect.height);
        const shouldRefresh =
          !currentMask ||
          Boolean(hasMoved) ||
          (obstacle.shape === "canvas" && frame - currentMask.frame >= 8);
        if (shouldRefresh) {
          const mask = createMask(obstacle, rect);
          if (mask) masks.set(element, mask);
        }

        const mask = masks.get(element);
        if (!mask) continue;

        const startY = Math.max(Math.ceil(drop.y + drop.length), Math.ceil(rect.top));
        const endY = Math.min(Math.ceil(nextY + drop.length), Math.floor(rect.bottom));

        for (let y = startY; y <= endY; y += 1) {
          if (isMaskedPixel(mask, drop.x, y)) return y;
        }
      }

      return undefined;
    };

    const createSplash = (drop: Drop, surfaceY: number) => {
      const count = 3 + Math.floor(Math.random() * 4);

      for (let index = 0; index < count; index += 1) {
        const life = 8 + Math.floor(Math.random() * 8);
        splashes.push({
          x: drop.x,
          y: surfaceY - 1,
          velocityX: -2.2 + Math.random() * 4.4,
          velocityY: -1.5 - Math.random() * 3.8,
          life,
          maxLife: life,
          size: 0.8 + Math.random() * 1.8,
        });
      }

      if (splashes.length > MAX_SPLASHES) splashes.splice(0, splashes.length - MAX_SPLASHES);
    };

    const draw = () => {
      frame += 1;
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      context.strokeStyle = "rgba(203, 232, 255, 0.75)";
      context.lineWidth = 1.35;
      context.lineCap = "round";
      context.beginPath();

      drops.forEach((drop) => {
        const nextY = drop.y + drop.speed;
        const impactY = findImpact(drop, nextY);

        if (impactY !== undefined || nextY > window.innerHeight) {
          if (impactY !== undefined) createSplash(drop, impactY);
          resetDrop(drop);
          return;
        }

        context.moveTo(drop.x, drop.y);
        context.lineTo(drop.x - drop.drift * 3, drop.y + drop.length);
        drop.x += drop.drift;
        drop.drift = Math.max(-1.8, Math.min(1.8, drop.drift + (Math.random() - 0.5) * 0.12));
        drop.speed = Math.min(drop.speed + drop.acceleration, drop.maxSpeed);
        drop.y = nextY;
      });

      context.stroke();

      for (let index = splashes.length - 1; index >= 0; index -= 1) {
        const splash = splashes[index];
        splash.x += splash.velocityX;
        splash.y += splash.velocityY;
        splash.velocityY += 0.32;
        splash.life -= 1;

        if (splash.life <= 0) {
          splashes.splice(index, 1);
          continue;
        }

        context.fillStyle = `rgba(197, 230, 255, ${(splash.life / splash.maxLife) * 0.8})`;
        context.fillRect(splash.x, splash.y, splash.size, splash.size);
      }

      frameId = window.requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);
    draw();

    return () => {
      window.cancelAnimationFrame(frameId);
      window.removeEventListener("resize", resize);
    };
  }, [active, obstacles]);

  return <canvas ref={canvasRef} className="rain-overlay" aria-hidden="true" />;
}
